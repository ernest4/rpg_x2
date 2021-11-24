import { createAction } from "redux-actions";

export const test = createAction("TEST");
export const setComponentsSchema = createAction("SET_COMPONENTS_SCHEMA");
export const setComponentsEnum = createAction("SET_COMPONENTS_ENUM");
export const setCurrentEntityId = createAction("SET_CURRENT_ENTITY_ID");
export const setCurrentEntityComponents = createAction("SET_CURRENT_ENTITY_COMPONENTS");

export const setCurrentEntityComponentsUpdateHash = createAction(
  "SET_CURRENT_ENTITY_COMPONENTS_UPDATE_HASH"
);
export const setCurrentEntityComponentsAddList = createAction(
  "SET_CURRENT_ENTITY_COMPONENTS_ADD_LIST"
);
export const setCurrentEntityComponentsRemoveList = createAction(
  "SET_CURRENT_ENTITY_COMPONENTS_REMOVE_LIST"
);
export const setAvailableComponentsList = createAction("SET_AVAILABLE_COMPONENTS_LIST");
export const setRemoveEntity = createAction("SET_REMOVE_ENTITY");
export const setCreateEntity = createAction("SET_CREATE_ENTITY");
export const setCloneEntity = createAction("SET_CLONE_ENTITY");
export const setSerialize = createAction("SET_SERIALIZE");
