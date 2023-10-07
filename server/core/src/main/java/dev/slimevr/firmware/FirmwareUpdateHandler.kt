package dev.slimevr.firmware

import dev.slimevr.VRServer
import dev.slimevr.tracking.trackers.Tracker
import dev.slimevr.tracking.trackers.TrackerStatus
import dev.slimevr.tracking.trackers.TrackerStatusListener
import dev.slimevr.tracking.trackers.udp.UDPDevice
import dev.slimevr.util.LRUCache
import io.eiren.util.logging.LogManager
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.InputStream
import java.net.URL
import java.util.concurrent.*

class FirmwareUpdateHandler(private val server: VRServer) : TrackerStatusListener {

    private val updatingDevices: MutableMap<UpdateDeviceId<*>, UpdateStatusEvent<*>> = HashMap()
    private val listeners: MutableList<FirmwareUpdateListener> = CopyOnWriteArrayList();
    private val firmwareCache = LRUCache<String, CompletableFuture<ByteArray>>(5)

    fun addListener(channel: FirmwareUpdateListener) {
        listeners.add(channel)
    }

    fun removeListener(channel: FirmwareUpdateListener) {
        listeners.removeIf { channel == it }
    }

    init {
        server.addTrackerStatusListener(this);
    }

    private fun startOtaUpdate(firmware: ByteArray, deviceId: UpdateDeviceId<Int>) {
        val udpDevice: UDPDevice? =
            (this.server.deviceManager.devices.find { device -> device is UDPDevice && device.id == deviceId.id }) as UDPDevice?

        if (udpDevice == null) {
            onStatusChange(UpdateStatusEvent(deviceId, FirmwareUpdateStatus.ERROR_DEVICE_NOT_FOUND))
            return
        }
        OTAUpdateTask(firmware, deviceId, udpDevice.ipAddress, this::onStatusChange).run()
    }

    fun startFirmwareUpdateTask(firmwareUrl: String, method: FirmwareUpdateMethod, deviceId: UpdateDeviceId<*>) {

        if (this.updatingDevices[deviceId] != null) {
			LogManager.info("[FirmwareUpdateHandler] Device is already updating, Skipping")
            return
        }
        onStatusChange(
            UpdateStatusEvent(
                deviceId,
                FirmwareUpdateStatus.DOWNLOADING
            )
        )

        // We add the firmware to an LRU cache
        // this insert a Completable future that will run in the background
        // Each update task should either get the future or create a new one
        val firmwareFuture = firmwareCache.getOrPut(firmwareUrl) {
            CompletableFuture.supplyAsync {
				LogManager.info("[FirmwareUpdateHandler] Downloading firmware $firmwareUrl")
                downloadFirmware(firmwareUrl)
            }
        }

        CompletableFuture.supplyAsync {
            // Wait for the future to complete before continuing
            // Avoids downloading the same firmware multiple times when updating multiple devices at the same time
            val firmware = firmwareFuture.get()

            if (firmware == null) {
                onStatusChange(
                    UpdateStatusEvent(
                        deviceId,
                        FirmwareUpdateStatus.ERROR_DOWNLOAD_FAILED
                    )
                )
                return@supplyAsync
            }

            when (method) {
                FirmwareUpdateMethod.OTA -> {
                    if (deviceId.id !is Int)
                        error("invalid state, the device id is not an int")
                    startOtaUpdate(
                        firmware,
                        UpdateDeviceId(FirmwareUpdateMethod.OTA, deviceId.id)
                    )
                }

                FirmwareUpdateMethod.SERIAL -> TODO("Implement serial task")
            }
        }
            // Added a timeout, the update process should take less than a minute
            // else cancel the task and display an error to the user\
            // Questions:
            //  - what happen with bad internet? the avg firmware is 500kb
            //  - Should we have the timeout after the download ?
            .orTimeout(1, TimeUnit.MINUTES)
            .whenComplete { _, u ->
                if (u != null) {
                    onStatusChange(
                        UpdateStatusEvent(
                            deviceId,
                            if (u is TimeoutException) FirmwareUpdateStatus.ERROR_TIMEOUT else FirmwareUpdateStatus.ERROR_UNKNOWN
                        )
                    )
                }
            }
    }

    private fun <T> onStatusChange(event: UpdateStatusEvent<T>) {
        this.updatingDevices[event.deviceId] = event
        if (event.status == FirmwareUpdateStatus.DONE || event.status.isError())
            this.updatingDevices.remove(event.deviceId)
        println("${event.status} ${event.progress}")
        listeners.forEach { l -> l.onUpdateStatusChange(event) }
    }

    override fun onTrackerStatusChanged(tracker: Tracker, oldStatus: TrackerStatus, newStatus: TrackerStatus) {
        val device = tracker.device;
        if (device !is UDPDevice) return;

        val deviceStatusKey = updatingDevices.keys.find { it.id == device.id } ?: return;
        val updateStatus = updatingDevices[deviceStatusKey] ?: return;

        // We check for the reconnection of the tracker, once the tracker reconnected we notify the user that the update is completed
        if (updateStatus.status == FirmwareUpdateStatus.REBOOTING && oldStatus == TrackerStatus.DISCONNECTED && newStatus == TrackerStatus.OK) {
            onStatusChange(UpdateStatusEvent(updateStatus.deviceId, FirmwareUpdateStatus.DONE))
        }
    }
}

fun downloadFirmware(url: String): ByteArray? {
    val outputStream = ByteArrayOutputStream()

    try {
        val chunk = ByteArray(4096)
        var bytesRead: Int
        val stream: InputStream = URL(url).openStream()
        while (stream.read(chunk).also { bytesRead = it } > 0) {
            outputStream.write(chunk, 0, bytesRead)
        }
    } catch (e: IOException) {
        error("Cant download firmware $url")
    }

    return outputStream.toByteArray()
}
