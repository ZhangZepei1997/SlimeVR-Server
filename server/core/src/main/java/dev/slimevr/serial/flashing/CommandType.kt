package dev.slimevr.serial.flashing

import kotlin.reflect.KClass


enum class CommandType(val value: Byte, val size: Short, val packetClass: KClass<out Packet>) {
    // Four 32-bit (4 bytes) words: size to erase, number of data packets,
    // data size in one packet, flash offset.
    FLASH_BEGIN(0x02, 16, BeginFlashPacket::class),
    FLASH_DATA(0x03, 0, Packet::class),
    FLASH_END(0x04, 0, Packet::class),
    MEM_BEGIN(0x05, 0, Packet::class),
    MEM_END(0x06, 0, Packet::class),
    MEM_DATA(0x07, 0, Packet::class),
    SYNC(0x08, 0, Packet::class),
    WRITE_REG(0x09, 0, Packet::class),
    READ_REG(0x0a, 0, Packet::class);

    companion object {
        fun getByValue(value: Byte): CommandType? = byValue[value]
    }
}

private val byValue = CommandType.entries.associateBy { it.value }
