import { useLocalization } from '@fluent/react';
import { Typography } from '../commons/Typography';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  FirmwareToolContextC,
  useFirmwareToolContext,
} from '../../hooks/firmware-tool';
import { AddImusStep } from './AddImusStep';
import { SelectBoardStep } from './SelectBoardStep';
import { BoardPinsStep } from './BoardPinsStep';
import VerticalStepper from '../commons/VerticalStepper';
import { LoaderIcon, SlimeState } from '../commons/icon/LoaderIcon';
import { Button } from '../commons/Button';
import { SelectFirmwareStep } from './SelectFirmwareStep';
import { BuildStep } from './BuildStep';
import { FlashingMethodStep } from './FlashingMethodStep';

function FirmwareToolContent() {
  const { l10n } = useLocalization();
  const context = useFirmwareToolContext();
  const { isError, isGlobalLoading: isLoading, retry } = context;
  return (
    <FirmwareToolContextC.Provider value={context}>
      <div className="flex flex-col bg-background-70 p-4 rounded-md overflow-y-auto h-full">
        <Typography variant="main-title">
          {l10n.getString('settings-firmware-tool')}
        </Typography>
        <div className="flex flex-col pt-2 pb-4">
          <>
            {l10n
              .getString('settings-firmware-tool-description')
              .split('\n')
              .map((line, i) => (
                <Typography color="secondary" key={i}>
                  {line}
                </Typography>
              ))}
          </>
        </div>
        <div className="m-4 h-full">
          {isError && (
            <div className="w-full flex flex-col justify-center items-center gap-3 h-full ">
              <LoaderIcon slimeState={SlimeState.SAD}></LoaderIcon>
              <Typography variant="section-title">
                Oops the firmware tool is not available at the moment. Come back
                later!
              </Typography>
              <Button variant="primary" onClick={retry}>
                Retry
              </Button>
            </div>
          )}
          {isLoading && (
            <div className="w-full flex flex-col justify-center items-center gap-3 h-full ">
              <LoaderIcon slimeState={SlimeState.JUMPY}></LoaderIcon>
              <Typography variant="section-title">Loading....</Typography>
            </div>
          )}
          {!isError && !isLoading && (
            <VerticalStepper
              steps={[
                { component: SelectBoardStep, title: 'Slect your board' },
                { component: BoardPinsStep, title: 'Check the pins!' },
                { component: AddImusStep, title: 'Declare your imus!' },
                {
                  component: SelectFirmwareStep,
                  title: 'Select the firmware version',
                },
                {
                  component: FlashingMethodStep,
                  title: 'Flashing Method',
                },
                { component: BuildStep, title: 'Building' },
              ]}
            />
          )}
        </div>
      </div>
    </FirmwareToolContextC.Provider>
  );
}

export function FirmwareToolSettings() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // default: true
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <FirmwareToolContent />
    </QueryClientProvider>
  );
}
