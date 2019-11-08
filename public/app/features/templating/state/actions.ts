import { VariableModel } from '../variable';
import { actionCreatorFactory } from '../../../core/redux';

export interface CreateVariable<T extends VariableModel = VariableModel> {
  model: T;
  defaults: T;
}

export const createVariable = actionCreatorFactory<CreateVariable>('CORE_TEMPLATING_CREATE_VARIABLE').create();

export interface UpdateVariableProp<T> {
  id: number;
  propName: string;
  value: T;
}

export const updateVariableProp = actionCreatorFactory<UpdateVariableProp<any>>(
  'CORE_TEMPLATING_UPDATE_VARIABLE_PROP'
).create();

export interface RemoveVariable {
  id: number;
}

export const removeVariable = actionCreatorFactory<RemoveVariable>('CORE_TEMPLATING_REMOVE_VARIABLE').create();

export interface ChangeVariableType<T extends VariableModel = VariableModel> {
  id: number;
  defaults: T;
}

export const changeVariableType = actionCreatorFactory<ChangeVariableType>(
  'CORE_TEMPLATING_CHANGE_VARIABLE_TYPE'
).create();
