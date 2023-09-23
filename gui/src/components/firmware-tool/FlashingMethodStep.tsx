import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { useForm } from 'react-hook-form';
import { Radio } from '../commons/Radio';
import { useWebsocketAPI } from '../../hooks/websocket-api';
import { useEffect, useState } from 'react';
import {
  FlashingMethod,
  NewSerialDeviceResponseT,
  RpcMessage,
  SerialDevicesRequestT,
  SerialDevicesResponseT,
} from 'solarxr-protocol';
import { Button } from '../commons/Button';
import classNames from 'classnames';
import { useAppContext } from '../../hooks/app';

interface FlashingMethodForm {
  flashingMethod?: 'OTA' | 'Serial';
}

export function SerialDevicesList() {
  const { selectedDevice, selectDevice } = useFirmwareTool();
  const { sendRPCPacket, useRPCPacket } = useWebsocketAPI();
  const [devicesMap, setDevicesMap] = useState(new Map());

  useEffect(() => {
    sendRPCPacket(RpcMessage.SerialDevicesRequest, new SerialDevicesRequestT());
    selectDevice(null);
  }, []);

  useRPCPacket(
    RpcMessage.SerialDevicesResponse,
    (res: SerialDevicesResponseT) => {
      setDevicesMap(
        new Map(res.devices.map((device) => [device.port, device]))
      );
    }
  );

  useRPCPacket(
    RpcMessage.NewSerialDeviceResponse,
    ({ device }: NewSerialDeviceResponseT) => {
      if (device?.port)
        setDevicesMap(new Map(devicesMap.set(device.port.toString(), device)));
    }
  );

  return (
    <>
      <Typography variant="standard" color="secondary">
        Please select the device you want to flash
      </Typography>
      <Typography variant="section-title">Detected Serial Devices:</Typography>
      <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-2">
        {[...devicesMap.keys()].map((port) => (
          <div
            key={port}
            className={classNames(
              'p-4 rounded-lg hover:bg-background-50 transition-colors flex items-center',
              (selectedDevice?.deviceId === devicesMap.get(port) &&
                'bg-background-50') ||
                'bg-background-60'
            )}
            onClick={() =>
              selectDevice({
                type: FlashingMethod.SERIAL,
                deviceId: devicesMap.get(port),
              })
            }
          >
            {devicesMap.get(port).name}
          </div>
        ))}
        <div className="bg-background-60 p-4 rounded-lg flex justify-between animate-pulse items-center">
          looking for more devices....
          <LoaderIcon slimeState={SlimeState.JUMPY} size={30}></LoaderIcon>
        </div>
      </div>
    </>
  );
}

export function OTADevicesList() {
  const { selectedDevice, selectDevice } = useFirmwareTool();
  const { state } = useAppContext();

  return (
    <>
      <Typography variant="standard" color="secondary">
        Please select the device you want to flash
      </Typography>
      <Typography variant="section-title">Detected OTA Devices:</Typography>
      <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-2">
        {state.datafeed?.devices.map(({ id, customName }) => (
          <div
            key={id?.id.toString()}
            className={classNames(
              'p-4 rounded-lg hover:bg-background-50 transition-colors flex items-center',
              (selectedDevice?.deviceId === id?.id && 'bg-background-50') ||
                'bg-background-60'
            )}
            onClick={() => {
              if (id?.id === undefined)
                throw new Error('invalid state - no device id');
              selectDevice({
                type: FlashingMethod.OTA,
                deviceId: id?.id,
              });
            }}
          >
            {customName}
          </div>
        ))}
      </div>
    </>
  );
}

export function FlashingMethodStep({
  nextStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
  isActive: boolean;
}) {
  const { l10n } = useLocalization();
  const { isGlobalLoading, selectedDevice } = useFirmwareTool();

  const { control, watch } = useForm<FlashingMethodForm>({
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const flashingMethod = watch('flashingMethod');

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-grow flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString(
              'settings-firmware-tool-flash-method-step-description'
            )}
          </Typography>
        </div>
        <div className="my-4">
          {!isGlobalLoading && (
            <div className="flex flex-col gap-3">
              <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-3">
                <Radio
                  control={control}
                  name="flashingMethod"
                  value={'OTA'}
                  label="OTA"
                  description="Use the over the air method. Your tacker will use the wifi to update the tacker. Works only on already setup trackers"
                ></Radio>
                <Radio
                  control={control}
                  name="flashingMethod"
                  value={'Serial'}
                  label="Serial"
                  description="Use a usb cable to update your tacker"
                ></Radio>
              </div>
              {flashingMethod === 'Serial' && (
                <SerialDevicesList></SerialDevicesList>
              )}
              {flashingMethod === 'OTA' && <OTADevicesList></OTADevicesList>}
              <Button
                variant="primary"
                disabled={!selectedDevice}
                onClick={nextStep}
              >
                Next
              </Button>
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
