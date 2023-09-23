import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';
import { CreateBoardConfigDTO } from '../../firmware-tool-api/firmwareToolSchemas';
import classNames from 'classnames';
import { Button } from '../commons/Button';
import { useGetFirmwaresBoards } from '../../firmware-tool-api/firmwareToolComponents';

export function SelectBoardStep({
  nextStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const { l10n } = useLocalization();
  const { selectBoard, newConfig } = useFirmwareTool();
  const { isFetching, data: boards } = useGetFirmwaresBoards({});

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-grow flex-col gap-4">
          <Typography color="secondary">
            {l10n.getString('settings-firmware-tool-board-step-description')}
          </Typography>
        </div>
        <div className="my-4">
          {!isFetching && (
            <div className="gap-2 flex flex-col">
              <div className="grid sm:grid-cols-2 mobile:grid-cols-1 gap-2">
                {boards?.map((board) => (
                  <div
                    key={board}
                    className={classNames(
                      'p-3 rounded-md hover:bg-background-50',
                      {
                        'bg-background-50':
                          newConfig?.boardConfig?.type === board,
                        'bg-background-60':
                          newConfig?.boardConfig?.type !== board,
                      }
                    )}
                    onClick={() => {
                      selectBoard(board as CreateBoardConfigDTO['type']);
                    }}
                  >
                    {l10n.getString(`firmware-board-${board}`)}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={!newConfig?.boardConfig?.type}
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
