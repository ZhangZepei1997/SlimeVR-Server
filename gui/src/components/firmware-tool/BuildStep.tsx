import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { fetchPostFirmwaresBuild } from '../../firmware-tool-api/firmwareToolComponents';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import {
  BuildResponseDTO,
  CreateBuildFirmwareDTO,
} from '../../firmware-tool-api/firmwareToolSchemas';
import { useEffect } from 'react';
import {
  firmwareToolBaseUrl,
  firmwareToolS3BaseUrl,
} from '../../firmware-tool-api/firmwareToolFetcher';
import { useWebsocketAPI } from '../../hooks/websocket-api';
import {
  DeviceIdT,
  DeviceIdTableT,
  FirmwareDeviceId,
  FirmwareUpdateRequestT,
  FlashingMethod,
  RpcMessage,
} from 'solarxr-protocol';

export function BuildStep({
  isActive,
}: {
  nextStep: () => void;
  prevStep: () => void;
  isActive: boolean;
}) {
  const { l10n } = useLocalization();
  const { sendRPCPacket } = useWebsocketAPI();
  const {
    isGlobalLoading,
    newConfig,
    setBuildStatus,
    buildStatus,
    selectedDevice,
  } = useFirmwareTool();

  const startBuild = async () => {
    try {
      const res = await fetchPostFirmwaresBuild({
        body: newConfig as CreateBuildFirmwareDTO,
      });

      if (res.status !== 'DONE') {
        const events = new EventSource(
          `${firmwareToolBaseUrl}/firmwares/build-status/${res.id}`
        );
        events.onmessage = ({ data }) => {
          const buildEvent: BuildResponseDTO & { message: string } =
            JSON.parse(data);
          console.log('[BUILD EVENT]', buildEvent);
          setBuildStatus(buildEvent);
        };
      } else {
        setBuildStatus({ ...res, message: 'Build Complete' });
      }
    } catch (e) {
      setBuildStatus({ id: '', status: 'FAILED', message: 'Error' });
    }
  };

  useEffect(() => {
    if (!isActive) return;
    startBuild();
  }, [isActive]);

  useEffect(() => {
    if (buildStatus.status === 'DONE') {
      if (!selectedDevice || !buildStatus.firmwareFiles)
        throw new Error('invalid state - no selected device or firmware files');
      console.log('build complete, next step');
      const req = new FirmwareUpdateRequestT();
      req.flashingMethod = selectedDevice.type;

      if (selectedDevice.type == FlashingMethod.OTA) {
        req.deviceIdType =
          FirmwareDeviceId.solarxr_protocol_datatypes_DeviceIdTable;
        const id = new DeviceIdTableT();
        const dId = new DeviceIdT();
        dId.id = +selectedDevice.deviceId;
        id.id = dId;
        req.deviceId = id;
      }
      // The last firmware file in the list should always be the firmware.bin
      // the other files are for the partitions
      req.firmwareUrl = `${firmwareToolS3BaseUrl}/${
        buildStatus.firmwareFiles[(buildStatus.firmwareFiles?.length ?? 1) - 1]
          .url
      }`;
      sendRPCPacket(RpcMessage.FirmwareUpdateRequest, req);
    }
  }, [buildStatus]);

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-grow flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString('settings-firmware-tool-build-step-description')}
          </Typography>
        </div>
        <div className="my-4">
          {!isGlobalLoading && (
            <div className="flex justify-center flex-col items-center gap-3 h-44">
              <LoaderIcon
                slimeState={
                  buildStatus?.status !== 'FAILED'
                    ? SlimeState.JUMPY
                    : SlimeState.SAD
                }
              ></LoaderIcon>
              <Typography variant="section-title" color="secondary">
                {buildStatus?.message}
              </Typography>
            </div>
          )}
          {isGlobalLoading && (
            <div className="flex justify-center flex-col items-center gap-3 h-44">
              <LoaderIcon slimeState={SlimeState.JUMPY}></LoaderIcon>
              <Typography color="secondary">Loading ...</Typography>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
