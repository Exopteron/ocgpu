import { ComponentAPI } from "./api/componentapi";
import { event } from "./api/eventapi";

export const EventAPI: event = require("event");
export const Component: ComponentAPI = require("component");
export const ThreadAPI: ThreadAPI = require("thread");
export const Terminal: TermAPI = require("term");
export const GPU: GPUApi = Component.gpu;