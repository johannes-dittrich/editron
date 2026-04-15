"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

export type UploadFile = {
  id: string;
  file: File;
  kind: "source" | "reference" | "brief_audio";
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  uploadId?: string;
  error?: string;
};

type UploadsState = {
  files: UploadFile[];
};

type UploadsAction =
  | { type: "ADD_FILE"; payload: UploadFile }
  | { type: "UPDATE_PROGRESS"; id: string; progress: number }
  | { type: "SET_STATUS"; id: string; status: UploadFile["status"]; uploadId?: string; error?: string }
  | { type: "REMOVE_FILE"; id: string };

function uploadsReducer(state: UploadsState, action: UploadsAction): UploadsState {
  switch (action.type) {
    case "ADD_FILE":
      return { files: [...state.files, action.payload] };
    case "UPDATE_PROGRESS":
      return {
        files: state.files.map((f) =>
          f.id === action.id ? { ...f, progress: action.progress } : f
        ),
      };
    case "SET_STATUS":
      return {
        files: state.files.map((f) =>
          f.id === action.id
            ? { ...f, status: action.status, uploadId: action.uploadId ?? f.uploadId, error: action.error }
            : f
        ),
      };
    case "REMOVE_FILE":
      return { files: state.files.filter((f) => f.id !== action.id) };
    default:
      return state;
  }
}

const UploadsContext = createContext<{
  state: UploadsState;
  dispatch: Dispatch<UploadsAction>;
} | null>(null);

export function UploadsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uploadsReducer, { files: [] });
  return (
    <UploadsContext.Provider value={{ state, dispatch }}>
      {children}
    </UploadsContext.Provider>
  );
}

export function useUploads() {
  const ctx = useContext(UploadsContext);
  if (!ctx) throw new Error("useUploads must be used inside UploadsProvider");
  return ctx;
}
