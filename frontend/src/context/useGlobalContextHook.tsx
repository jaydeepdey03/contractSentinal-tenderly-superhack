import {useContext} from "react";
import {GlobalContext} from "./GlobalContext";

export default function useGlobalContextHook() {
  return useContext(GlobalContext);
}
