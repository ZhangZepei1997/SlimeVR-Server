import { createContext, useContext, useState } from 'react';
import { fetchGetFirmwaresDefaultConfigBoard, useGetHealth } from '../firmware-tool-api/firmwareToolComponents';
import { BuildResponseDTO, CreateBoardConfigDTO, CreateBuildFirmwareDTO, DefaultBuildConfigDTO } from '../firmware-tool-api/firmwareToolSchemas';
import { BoardPinsForm } from '../components/firmware-tool/BoardPinsStep';
import { DeepPartial } from 'react-hook-form';
import { FlashingMethod } from 'solarxr-protocol';

export type PartialBuildFirmware = DeepPartial<CreateBuildFirmwareDTO>
export type FirmwareBuildStatus = BuildResponseDTO & { message: string };
export type SelectedDevice = { type: FlashingMethod, deviceId: string | number };


export interface FirmwareToolContext {
  selectBoard: (boardType: CreateBoardConfigDTO['type']) => Promise<void>;
  selectVersion: (version: CreateBuildFirmwareDTO['version']) => void;
  updatePins: (form: BoardPinsForm) => void;
  updateImus: (imus: CreateBuildFirmwareDTO['imusConfig']) => void;
  setBuildStatus: (buildStatus: FirmwareBuildStatus) => void;
  selectDevice: (device: SelectedDevice | null) => void;
  retry: () => void;
  buildStatus: FirmwareBuildStatus;
  defaultConfig: DefaultBuildConfigDTO | null;
  newConfig: PartialBuildFirmware | null;
  selectedDevice: SelectedDevice | null;
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
  const [defaultConfig, setDefaultConfig] = useState<DefaultBuildConfigDTO | null>(null);
  const [selectedDevice, selectDevice] = useState<SelectedDevice | null>(null);
  const [newConfig, setNewConfig] = useState<PartialBuildFirmware>({});
  const [isLoading, setLoading] = useState(false);
  const { isError, isInitialLoading, refetch } = useGetHealth({});
  const [buildStatus, setBuildStatus] = useState<FirmwareBuildStatus>({ status: 'BUILDING', id: '', message: 'Building Firmware ....' });

  return {
    selectBoard: async (boardType: CreateBoardConfigDTO['type']) => {
      setLoading(true);
      const boardDefaults = await fetchGetFirmwaresDefaultConfigBoard({
        pathParams: { board: boardType },
      });
      setDefaultConfig(boardDefaults);
      setNewConfig((currConfig) => ({ ...currConfig, boardConfig: { ...currConfig.boardConfig, type: boardType } }))
      setLoading(false);
    },
    updatePins: (form: BoardPinsForm) => {
      setNewConfig((currConfig) => {
        return {
          ...currConfig,
          imusConfig: [...currConfig?.imusConfig || []],
          boardConfig: {
            ...currConfig.boardConfig,
            ...form,
          }
        };
      });
    },
    updateImus: (imus: CreateBuildFirmwareDTO['imusConfig']) => {
      setNewConfig((currConfig) => {
        return {
          ...currConfig,
          imusConfig: imus.map(({ rotation, ...fields }) => ({ ...fields, rotation: Number(rotation) })) // Make sure that the rotation is handled as number
          // imusConfig: imus
        }
      })
    },
    retry: async () => {
      setLoading(true);
      await refetch();
      setLoading(false);
    },
    selectVersion: (version: CreateBuildFirmwareDTO['version']) => {
      setNewConfig((currConfig) => ({ ...currConfig, version }))
    },
    setBuildStatus,
    selectDevice,
    selectedDevice,
    buildStatus,
    defaultConfig,
    newConfig,
    isStepLoading: isLoading,
    isGlobalLoading: isInitialLoading,
    isError,
  };
}
