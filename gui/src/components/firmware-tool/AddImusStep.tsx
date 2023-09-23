import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { Button } from '../commons/Button';
import { Control, useForm } from 'react-hook-form';
import {
  CreateImuConfigDTO,
  Imudto,
} from '../../firmware-tool-api/firmwareToolSchemas';
import { Dropdown } from '../commons/Dropdown';
import { TrashIcon } from '../commons/icon/TrashIcon';
import { Input } from '../commons/Input';
import { ArrowDownIcon, ArrowUpIcon } from '../commons/icon/ArrowIcons';
import { useRef, useState } from 'react';
import classNames from 'classnames';
import { useElemSize } from '../../hooks/layout';
import { useGetFirmwaresImus } from '../../firmware-tool-api/firmwareToolComponents';

function IMUCard({
  control,
  imuTypes,
  index,
  onDelete,
}: {
  imuTypes: Imudto[];
  control: Control<{ imus: CreateImuConfigDTO[] }, any>;
  index: number;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { height } = useElemSize(ref);

  return (
    <div className="rounded-lg flex flex-col">
      <div className="flex gap-3 p-4 shadow-md bg-background-50 rounded-md">
        <div className="bg-accent-background-40 rounded-full h-8 w-9 mt-[28px] flex flex-col items-center justify-center">
          <Typography variant="section-title" bold>
            {index + 1}
          </Typography>
        </div>
        <div className={'w-full flex flex-col gap-2'}>
          <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-3 fill-background-10">
            <label className="flex flex-col justify-end gap-1">
              Imu type
              <Dropdown
                control={control}
                name={`imus[${index}].type`}
                items={imuTypes.map(({ type }) => ({
                  label: type,
                  value: type,
                }))}
                variant="secondary"
                maxHeight="25vh"
                direction="down"
                placeholder="IMU Type"
                display="block"
              ></Dropdown>
            </label>

            <Input
              control={control}
              rules={{ required: { value: true, message: 'field is required' } }}
              type="number"
              name={`imus[${index}].rotation`}
              variant="primary"
              label="Rotation Degree"
              placeholder="Rotation Degree"
              autocomplete="off"
            ></Input>
          </div>
          <div
            className={classNames(
              ' duration-500 transition-[height] overflow-hidden'
            )}
            style={{ height: open ? height : 0 }}
          >
            <div
              ref={ref}
              className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-2"
            >
              <Input
                control={control}
                rules={{ required: true }}
                type="text"
                name={`imus[${index}].sclPin`}
                variant="primary"
                label="SCL Pin"
                placeholder="SCL Pin"
                autocomplete="off"
              ></Input>
              <Input
                control={control}
                rules={{ required: true }}
                type="text"
                name={`imus[${index}].sdaPin`}
                variant="primary"
                label="SDA Pin"
                placeholder="SDA Pin"
                autocomplete="off"
              ></Input>
              <Input
                control={control}
                rules={{ required: true }}
                type="text"
                name={`imus[${index}].intPin`}
                variant="primary"
                label="INT Pin"
                placeholder="INT Pin"
                autocomplete="off"
              ></Input>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-[25px] fill-background-10">
          <Button variant="quaternary" rounded onClick={onDelete}>
            <TrashIcon size={15}></TrashIcon>
          </Button>
        </div>
      </div>
      <div
        className="items-center flex justify-center hover:bg-background-60 bg-background-80 -mt-0.5 transition-colors duration-300  fill-background-10 rounded-b-lg pt-1 pb-0.5"
        onClick={() => setOpen(!open)}
      >
        <Typography>{open ? 'Show less' : 'Advanced options'}</Typography>
        {!open && <ArrowDownIcon></ArrowDownIcon>}
        {open && <ArrowUpIcon></ArrowUpIcon>}
      </div>
    </div>
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
  const {
    isStepLoading: isLoading,
    newConfig,
    defaultConfig,
    updateImus,
  } = useFirmwareTool();

  const {
    control,
    formState: { isValid: isValidState },
    reset,
    watch,
  } = useForm<{ imus: CreateImuConfigDTO[] }>({
    defaultValues: {
      imus: newConfig?.imusConfig || [],
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const { isFetching, data: imuTypes } = useGetFirmwaresImus({});

  const isAckchuallyLoading = isFetching || isLoading;
  const imus = watch('imus');

  const addImu = () => {
    if (!newConfig || !defaultConfig) throw new Error('unreachable');

    const currConfigPlaceholder = {
      ...(newConfig ?? {}),
      imusConfig: [...(newConfig.imusConfig ?? [])],
    };
    const imuPinToAdd =
      defaultConfig.imuPins[newConfig.imusConfig?.length ?? 0] ||
      defaultConfig.imuPins[0];
    const imuTypeToAdd: CreateImuConfigDTO['type'] =
      (newConfig.imusConfig?.length || 0) === 0
        ? 'IMU_BNO085'
        : currConfigPlaceholder.imusConfig[0]?.type ?? 'IMU_BNO085';
    reset({
      imus: [...imus, { ...imuPinToAdd, type: imuTypeToAdd }],
    });
  };
  const deleteImu = (index: number) => {
    reset({ imus: imus.filter((_, i) => i !== index) });
  };

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
        <div className="my-4 flex flex-col gap-4">
          {!isAckchuallyLoading && imuTypes && newConfig && (
            <>
              <div className="flex flex-col gap-3">
                <div className={classNames('grid gap-2 px-2', imus.length > 1 ? 'md:grid-cols-2 mobile:grid-cols-1' : 'grid-cols-1')}>
                  {imus.map((imu, index) => (
                    <IMUCard
                      control={control}
                      imuTypes={imuTypes}
                      key={`${index}:${imu.type}`}
                      index={index}
                      onDelete={() => deleteImu(index)}
                    ></IMUCard>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button variant="primary" onClick={addImu}>
                    Add more IMUs
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="tertiary" onClick={prevStep}>
                  Previous Step
                </Button>
                <Button
                  variant="primary"
                  disabled={!isValidState || imus.length === 0}
                  onClick={() => {
                    updateImus(imus);
                    nextStep();
                  }}
                >
                  LGTM
                </Button>
              </div>
            </>
          )}
          {isAckchuallyLoading && (
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
