package dev.slimevr.serial.flashing

import java.nio.ByteBuffer

class BeginFlashPacket(

) :
    Packet(CommandType.FLASH_BEGIN) {

    var firmwareSize: Int = 0;
    var blocks: Int = 0;
    var block_size: Int = 0;
    var offset: Int = 0;

    override fun decode(buffer: ByteBuffer) {
        this.firmwareSize = buffer.getInt();
        this.blocks = buffer.getInt();
        this.block_size = buffer.getInt();
        this.offset = buffer.getInt();
    }

    override fun encode(buffer: ByteBuffer) {
        TODO("Not yet implemented")
    }
}
