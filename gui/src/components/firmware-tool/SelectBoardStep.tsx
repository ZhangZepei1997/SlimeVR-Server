import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { TipBox } from '../commons/TipBox';
import { useFirmwareControllerGetBoardsTypes } from '../../firmware-tool-api/firmwareToolComponents';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { useFirmwareTool } from '../../hooks/firmware-tool';


export function SelectBoardStep({
    nextStep,
  }: {
    nextStep: () => void;
    prevStep: () => void;
  }) {
    const { l10n } = useLocalization();
    const { selectBoard } = useFirmwareTool()
    const { isFetching, data: boards } = useFirmwareControllerGetBoardsTypes({});



    return (
      <>
      <div className="flex flex-col w-full">
        <div className="flex flex-grow flex-col gap-4">
            <Typography color="secondary">
              {l10n.getString(
                'settings-firmware-tool-board-step-description'
              )}
            </Typography>
        </div>
        <div className='my-4'>
          {!isFetching &&
            <div className='grid sm:grid-cols-2 mobile:grid-cols-1 gap-2'>
              {boards?.map((board) => (
                <div key={board.boardType} className='bg-background-60 p-3 rounded-md hover:bg-background-50' onClick={() => {
                  selectBoard(board.boardType);
                  nextStep();
                }}>
                  {l10n.getString(`firmware-board-${board.boardType}`)}
                </div>)
              )}
            </div>
          }
          {isFetching && (
            <div className="flex justify-center flex-col items-center gap-3 h-44">
              <LoaderIcon slimeState={SlimeState.JUMPY}></LoaderIcon>
              <Typography color="secondary">Loading ...</Typography>
            </div>
          )}
        </div>
      </div>
      </>
    )
  }
