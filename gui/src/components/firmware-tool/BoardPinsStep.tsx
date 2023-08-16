import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { Button } from '../commons/Button';
import { useForm } from 'react-hook-form';
import {
  BoardPins,
  FirmwareBoardDTO,
} from '../../firmware-tool-api/firmwareToolSchemas';
import { Input } from '../commons/Input';
import { useEffect } from 'react';
import { CheckBox } from '../commons/Checkbox';

export interface BoardPinsForm {
  pins: BoardPins;
  enableLed: FirmwareBoardDTO['enableLed'];
}

export function BoardPinsStep({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const { l10n } = useLocalization();
  const { isStepLoading: isLoading, defaultConfig, updatePins } = useFirmwareTool();

  const { reset, control, watch, formState } = useForm<BoardPinsForm>({
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const formValue = watch();
  const ledEnabled = watch('enableLed');

  useEffect(() => {
    if (!defaultConfig) return;

    reset({
      pins: defaultConfig.board.pins,
      enableLed: defaultConfig.board.enableLed,
    });
  }, [defaultConfig]);

  return (
    <>
      <div className="flex flex-col w-full justify-between">
        <div className="flex flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString(
              'settings-firmware-tool-board-pins-step-description'
            )}
          </Typography>
        </div>
        <div className="my-4">
          {!isLoading && (
            <form className="grid grid-cols-2 gap-2">
              <Input
                control={control}
                type="text"
                rules={{ required: true }}
                name="pins.imuSDA"
                variant="secondary"
                label="IMU SDA Pin"
                placeholder="IMU SDA Pin"
              ></Input>
              <Input
                control={control}
                type="text"
                rules={{ required: true }}
                name="pins.imuSCL"
                variant="secondary"
                label="IMU SCL Pin"
                placeholder="IMU SCL Pin"
              ></Input>
              <label className="flex flex-col justify-end">
                {/* Allows to have the right spacing at the top of the checkbox */}
                <CheckBox
                  control={control}
                  color="tertiary"
                  name="enableLed"
                  variant="toggle"
                  outlined
                  label="Enable Led"
                ></CheckBox>
              </label>
              <Input
                control={control}
                rules={{ required: true }}
                type="text"
                name="pins.led"
                variant="secondary"
                label="LED Pin"
                placeholder="Led Pin"
                disabled={!ledEnabled}
              ></Input>
            </form>
          )}
          {isLoading && (
            <div className="flex justify-center flex-col items-center gap-3 h-44">
              <LoaderIcon slimeState={SlimeState.JUMPY}></LoaderIcon>
              <Typography color="secondary">Loading ...</Typography>
            </div>
          )}
        </div>
        <div className="flex justify-between">
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
        </div>
      </div>
    </>
  );
}
