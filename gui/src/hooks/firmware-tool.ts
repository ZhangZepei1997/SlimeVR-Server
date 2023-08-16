import { createContext, useContext, useState } from 'react';
import {
  BoardTypeBoard,
  BuildFirmwareDTO,
  FirmwareBoardDTO,
  IMUConfigDTO,
} from '../firmware-tool-api/firmwareToolSchemas';
import {
  fetchFirmwareControllerGetDefaultConfig,
  useFirmwareControllerGetDefaultConfig,
  useHealthControllerGetHealth,
} from '../firmware-tool-api/firmwareToolComponents';
import { BoardPinsForm } from '../components/firmware-tool/AddImusStep';

export interface FirmwareToolContext {
  selectBoard: (boardType: BoardTypeBoard['boardType']) => Promise<void>;
  updatePins: (form: BoardPinsForm) => void;
  addImu: () => void;
  retry: () => void;
  selectedBoard: BoardTypeBoard['boardType'] | null;
  defaultConfig: BuildFirmwareDTO | null;
  newConfig: BuildFirmwareDTO | null;
  isStepLoading: boolean;
  isGlobalLoading: boolean;
  isError: boolean;
}

export const FirmwareToolContextC = createContext<FirmwareToolContext>(
  undefined as any
);

export function useFirmwareTool() {
  const context = useContext<FirmwareToolContext>(FirmwareToolContextC);
  if (!context) {
    throw new Error('useFirmwareTool must be within a FirmwareToolContext Provider');
  }
  return context;
}

export function useFirmwareToolContext(): FirmwareToolContext {
  const [selectedBoard, setSelectedBoard] = useState<
    BoardTypeBoard['boardType'] | null
  >(null);
  const [defaultConfig, setDefaultConfig] = useState<BuildFirmwareDTO | null>(null);
  const [newConfig, setNewConfig] = useState<BuildFirmwareDTO | null>(null);
  const [isLoading, setLoading] = useState(false);
  const { isError, isInitialLoading, refetch } = useHealthControllerGetHealth({  }, { networkMode: 'online' });

  return {
    selectBoard: async (boardType: BoardTypeBoard['boardType']) => {
      setSelectedBoard(boardType);
      setLoading(true);
      const boardDefaults = await fetchFirmwareControllerGetDefaultConfig({
        pathParams: { board: boardType },
      });
      setDefaultConfig(boardDefaults);
      const config = JSON.parse(JSON.stringify(boardDefaults)) as BuildFirmwareDTO; // Deep copy
      config.imus.splice(1, 1);
      setNewConfig(config);
      setLoading(false);
    },
    updatePins: (form: BoardPinsForm) => {
      setNewConfig((currConfig) => {
        if (!currConfig) throw new Error('unreachable')
        return {
          ...currConfig,
          board: {
            ...currConfig.board,
            pins: form.pins,
            enableLed: form.enableLed,
          },
        };
      });
    },
    addImu: () => {
      setNewConfig((currConfig) => {
        if (!currConfig || !defaultConfig) throw new Error('unreachable')
        const itemToAdd =
          currConfig.imus.length > 0
            ? currConfig.imus[0]
            : defaultConfig.imus[1] as IMUConfigDTO;
        console.log(currConfig.imus, itemToAdd)
        return {
          ...currConfig,
          imus: [...currConfig.imus, itemToAdd],
        };
      });
    },
    retry: async () => {
      setLoading(true);
      await refetch();
      setLoading(false);
    },
    selectedBoard,
    defaultConfig,
    newConfig,
    isStepLoading: isLoading,
    isGlobalLoading: isInitialLoading,
    isError,
  };
}
