package dev.slimevr.desktop.firmware

import dev.slimevr.firmware.ISerialFlashingHandler


class DesktopSerialFlashingHandler: ISerialFlashingHandler {
	override fun availableBytes(): Int {
		TODO("Not yet implemented")
	}
	override fun changeBaud(baud: Int) {
		TODO("Not yet implemented")
	}

	override fun closeSerial() {
		TODO("Not yet implemented")
	}

	override fun flushIOBuffers() {
		TODO("Not yet implemented")
	}

	override fun openSerial() {
		TODO("Not yet implemented")
	}

	override fun read(length: Int): ByteArray {
		TODO("Not yet implemented")
	}

	override fun setDTR(value: Boolean) {
		TODO("Not yet implemented")
	}

	override fun setRTS(value: Boolean) {
		TODO("Not yet implemented")
	}

	override fun setReadTimeout(timeout: Long) {
		TODO("Not yet implemented")
	}

	override fun write(data: ByteArray) {
		TODO("Not yet implemented")
	}
}
