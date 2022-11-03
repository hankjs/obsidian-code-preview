/* eslint-disable */
import { DataAdapter } from "obsidian";

declare module "obsidian" {
  export interface DataAdapter {
    // Vault System Path
    basePath: string;
  }
}
