package dev.slimevr.serial.flashing

import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import kotlin.experimental.xor

enum class Direction(val value: Byte) {
    REQUEST(0x00),
    RESPONSE(0x01);

    companion object {
        fun getByValue(value: Byte): Direction? = byValue[value]
    }
}
private val byValue = Direction.entries.associateBy { it.value }

abstract class Packet(val command: CommandType) {

    var direction: Direction = Direction.REQUEST;
    var size: Short = 0;

    private fun encodeSLIP(input: ByteArray): ByteArray {
        val outputStream = ByteArrayOutputStream()
        outputStream.write(0xC0)
        for (byte in input) {
            when (byte.toInt()) {
                0xC0 -> {
                    outputStream.write(0xDB)
                    outputStream.write(0xDC)
                }

                0xDB -> {
                    outputStream.write(0xDB)
                    outputStream.write(0xDD)
                }

                else -> outputStream.write(byte.toInt())
            }
        }
        outputStream.write(0xC0)
        return outputStream.toByteArray()
    }

    private fun decodeSLIP(input: ByteArray): ByteArray {
        val outputStream = ByteArrayOutputStream()
        var i = 0
        while (i < input.size) {
            val byte = input[i]
            if (byte.toInt() == 0xDB) {
                i++
                when (input[i].toInt()) {
                    0xDC -> outputStream.write(0xC0)
                    0xDD -> outputStream.write(0xDB)
                }
            } else {
                outputStream.write(byte.toInt())
            }
            i++
        }
        return outputStream.toByteArray()
    }

    private fun calculateChecksum(data: ByteArray): Byte {
        var checksum: Byte = 0xEF.toByte()
        for (byte in data) {
            checksum = checksum.xor(byte)
        }
        return checksum
    }

    abstract fun decode(buffer: ByteBuffer);

    abstract fun encode(buffer: ByteBuffer);

    fun toByteArray(): ByteArray {
        val buff = ByteBuffer.allocate(8 + command.size).apply {
            put(direction.value)
            put(command.value)
            putShort(command.size)
            putInt(0) // TODO compute checksum on the right commands
        }
        encode(buff);
        return encodeSLIP(buff.array())
    }

    fun fromByteArray(byteArray: ByteArray): Packet {
        val decodedByteArray = decodeSLIP(byteArray)
        val buffer = ByteBuffer.wrap(decodedByteArray)

        direction = Direction.getByValue(buffer.get()) ?: error("unknown direction");
        val command = CommandType.getByValue(buffer.get()) ?: error("unknown command");

        val packet = command.packetClass.constructors.first().call(command);
        decode(buffer);
        return packet
    }
}


