import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { Button } from '../commons/Button';
import { useForm } from 'react-hook-form';
import {
  BoardPins,
  FirmwareBoardDTO,
  Imudto,
} from '../../firmware-tool-api/firmwareToolSchemas';
import { Input } from '../commons/Input';
import { useEffect } from 'react';
import { CheckBox } from '../commons/Checkbox';
import { useFirmwareControllerGetIMUSTypes } from '../../firmware-tool-api/firmwareToolComponents';
import { Dropdown } from '../commons/Dropdown';
import { TrashIcon } from '../commons/icon/TrashIcon';

export interface BoardPinsForm {
  pins: BoardPins;
  enableLed: FirmwareBoardDTO['enableLed'];
}

interface IMUCardForm {
  imuType: Imudto['type'];
}

function IMUCard({ imuTypes, index }: { imuTypes: Imudto[]; index: number }) {
  const { control } = useForm<IMUCardForm>({});

  return (
    <form className="bg-background-50 p-4 rounded-md flex gap-3">
      <div className="bg-accent-background-40 rounded-full h-8 w-8 flex flex-col items-center justify-center">
        <Typography variant="section-title" bold>
          {index + 1}
        </Typography>
      </div>
      <div className="w-full flex flex-col ">
        <div className="flex gap-3 fill-background-10">
          <Dropdown
            control={control}
            name="imuType"
            items={imuTypes.map(({ type }) => ({ label: type, value: type }))}
            variant="secondary"
            maxHeight="25vh"
            direction="down"
            placeholder="IMU Type"
            display='block'
          ></Dropdown>
          <Button variant="quaternary" rounded disabled>
            <TrashIcon size={15}></TrashIcon>
          </Button>
        </div>
        <div className="flex"></div>
      </div>
    </form>
  );
}

export function AddImusStep({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const { l10n } = useLocalization();
  const { isStepLoading: isLoading, newConfig, updatePins, addImu } = useFirmwareTool();
  const { isFetching, data: imuTypes } = useFirmwareControllerGetIMUSTypes({});

  const isAckchuallyLoading = isFetching || isLoading;

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString(
              'settings-firmware-tool-board-pins-step-description'
            )}
          </Typography>
        </div>
        <div className="my-4">
          {!isAckchuallyLoading && imuTypes && newConfig && (
            <div className="flex flex-col gap-3">
              <div className="grid md:grid-cols-2 mobile:grid-cols-1 gap-2 px-2">
                {newConfig.imus.map((imu, index) => (
                  <IMUCard
                    imuTypes={imuTypes}
                    key={index}
                    index={index}
                  ></IMUCard>
                ))}
              </div>
              <div className="flex justify-center">
                <Button variant="primary" onClick={addImu}>
                  Add more IMUs
                </Button>
              </div>
            </div>
          )}
          {isAckchuallyLoading && (
            <div className="flex justify-center flex-col items-center gap-3 h-44">
              <LoaderIcon slimeState={SlimeState.JUMPY}></LoaderIcon>
              <Typography color="secondary">Loading ...</Typography>
            </div>
          )}
        </div>
        {/* <div className="flex justify-between">
          <Button variant="tertiary" onClick={prevStep}>
            Previous Step
          </Button>
          <Button
            variant="primary"
            disabled={Object.keys(formState.errors).length !== 0}
            onClick={() => {
              updatePins(formValue);
              nextStep();
            }}
          >
            LGTM
          </Button>
        </div> */}
      </div>
    </>
  );
}
