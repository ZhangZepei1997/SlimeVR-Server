import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { Button } from '../commons/Button';
import { useForm } from 'react-hook-form';
import { Input } from '../commons/Input';
import { useEffect } from 'react';
import { CheckBox } from '../commons/Checkbox';
import { CreateBoardConfigDTO } from '../../firmware-tool-api/firmwareToolSchemas';
import { Dropdown } from '../commons/Dropdown';
import classNames from 'classnames';
import { useGetFirmwaresBatteries } from '../../firmware-tool-api/firmwareToolComponents';

export type BoardPinsForm = Omit<CreateBoardConfigDTO, 'type'>;

export function BoardPinsStep({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const { l10n } = useLocalization();
  const {
    isStepLoading: isLoading,
    defaultConfig,
    updatePins,
  } = useFirmwareTool();
  const { isFetching, data: batteryTypes } = useGetFirmwaresBatteries({});

  const { reset, control, watch, formState } = useForm<BoardPinsForm>({
    reValidateMode: 'onChange',
    defaultValues: {
      batteryResistances: [0, 0, 0],
    },
    mode: 'onChange',
  });

  const formValue = watch();
  const ledEnabled = watch('enableLed');
  const batteryType = watch('batteryType');

  useEffect(() => {
    if (!defaultConfig) return;
    const { type, ...resetConfig } = defaultConfig.boardConfig;
    reset({
      ...resetConfig,
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
        <div className="my-4 p-2">
          {!isLoading && !isFetching && batteryTypes && (
            <form className="flex flex-col gap-2">
              <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-2">
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
                  name="ledPin"
                  variant="secondary"
                  label="LED Pin"
                  placeholder="Led Pin"
                  disabled={!ledEnabled}
                ></Input>
              </div>
              <div
                className={classNames(
                  batteryType === 'BAT_EXTERNAL' &&
                    'bg-background-80 p-2 rounded-md',
                  'transition-all duration-500 flex-col flex gap-2'
                )}
              >
                <Dropdown
                  control={control}
                  name="batteryType"
                  variant="primary"
                  placeholder="Select a battery type"
                  direction="up"
                  display="block"
                  items={batteryTypes.map((battery) => ({
                    label: battery,
                    value: battery,
                  }))}
                ></Dropdown>
                {batteryType === 'BAT_EXTERNAL' && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      control={control}
                      rules={{ required: true }}
                      type="text"
                      name="batteryPin"
                      variant="secondary"
                      label="Battery Sensor Pin"
                      placeholder="Led Pin"
                    ></Input>
                    <Input
                      control={control}
                      rules={{ required: true, min: 0 }}
                      type="number"
                      name="batteryResistances[0]"
                      variant="secondary"
                      label="Battery Resistor"
                      placeholder="Led Pin"
                    ></Input>
                    <Input
                      control={control}
                      rules={{ required: true, min: 0 }}
                      type="number"
                      name="batteryResistances[1]"
                      variant="secondary"
                      label="Battery Shield R1"
                      placeholder="Led Pin"
                    ></Input>
                    <Input
                      control={control}
                      rules={{ required: true, min: 0 }}
                      type="number"
                      name="batteryResistances[2]"
                      variant="secondary"
                      label="Battery Shield R2"
                      placeholder="Led Pin"
                    ></Input>
                  </div>
                )}
              </div>
            </form>
          )}
          {(isLoading || isFetching) && (
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
