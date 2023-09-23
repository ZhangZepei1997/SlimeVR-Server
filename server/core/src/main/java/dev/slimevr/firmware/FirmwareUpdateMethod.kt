package dev.slimevr.firmware

enum class FirmwareUpdateMethod(val id: Int) {
	OTA(0), SERIAL(1);

	companion object {
		fun getById(id: Int): FirmwareUpdateMethod? = byId[id]
	}
}

private val byId = FirmwareUpdateMethod.entries.associateBy { it.id }

