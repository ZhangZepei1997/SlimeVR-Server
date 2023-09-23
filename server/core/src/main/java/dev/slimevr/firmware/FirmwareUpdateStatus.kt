package dev.slimevr.firmware

enum class FirmwareUpdateStatus(val id: Int) {
    DOWNLOADING(0),
    AUTHENTICATING(1),
    UPLOADING(2),
    REBOOTING(3),
    DONE(4),
    ERROR_DEVICE_NOT_FOUND(5),
    ERROR_TIMEOUT(6),
    ERROR_DOWNLOAD_FAILED(7),
    ERROR_AUTHENTICATION_FAILED(8),
    ERROR_UPLOAD_FAILED(9),
    ERROR_UNKNOWN(10);

    fun isError(): Boolean {
        return id in 5..10
    }

    companion object {
        fun getById(id: Int): FirmwareUpdateStatus? = byId[id]
    }
}

private val byId = FirmwareUpdateStatus.entries.associateBy { it.id }
