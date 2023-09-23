import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { useGetFirmwaresVersions } from '../../firmware-tool-api/firmwareToolComponents';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import classNames from 'classnames';
import { Button } from '../commons/Button';

export function SelectFirmwareStep({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const { l10n } = useLocalization();
  const { selectVersion, newConfig } = useFirmwareTool();
  const { isFetching, data: firmwares } = useGetFirmwaresVersions({});

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-grow flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString(
              'settings-firmware-tool-select-firmware-step-description'
            )}
          </Typography>
        </div>
        <div className="my-4">
          {!isFetching && (
            <div className="flex flex-col gap-4">
              <div className="grid xs:grid-cols-2 mobile:grid-cols-1 gap-2 xs:h-96 xs:overflow-y-auto xs:px-2">
                {firmwares?.map((firmwares) => (
                  <div
                    key={firmwares.id}
                    className={classNames(
                      'p-3 rounded-md hover:bg-background-50',
                      {
                        'bg-background-50':
                          newConfig?.version === firmwares.name,
                        'bg-background-60':
                          newConfig?.version !== firmwares.name,
                      }
                    )}
                    onClick={() => {
                      selectVersion(firmwares.name);
                    }}
                  >
                    {firmwares.name}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="tertiary" onClick={prevStep}>
                  Previous Step
                </Button>
                <Button
                  variant="primary"
                  disabled={!newConfig?.version}
                  onClick={() => {
                    nextStep();
                  }}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}
          {isFetching && (
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
