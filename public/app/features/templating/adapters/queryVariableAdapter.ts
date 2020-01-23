import { containsVariable, QueryVariableModel } from '../variable';
import { queryVariableReducer, QueryVariableState } from '../state/queryVariableReducer';
import { dispatch } from '../../../store/store';
import { setOptionAsCurrent, setOptionFromUrl, updateQueryVariableOptions } from '../state/actions';
import { createVariableAdapter } from './index';
import { QueryVariablePicker } from '../picker/QueryVariablePicker';
import { QueryVariableEditor } from '../editor/QueryVariableEditor';

export const createQueryVariableAdapter = () =>
  createVariableAdapter<QueryVariableModel, QueryVariableState>('query', {
    instanceReducer: queryVariableReducer,
    picker: QueryVariablePicker,
    editor: QueryVariableEditor,
    dependsOn: (variable, variableToTest) => {
      return containsVariable(variable.query, variable.datasource, variable.regex, variableToTest.name);
    },
    setValue: async (variable, option) => {
      return new Promise(async resolve => {
        await dispatch(setOptionAsCurrent(variable, option));
        resolve();
      });
    },
    setValueFromUrl: async (variable, urlValue) => {
      return new Promise(async resolve => {
        await dispatch(setOptionFromUrl(variable, urlValue));
        resolve();
      });
    },
    updateOptions: (variable, searchFilter) => {
      return new Promise(async resolve => {
        await dispatch(updateQueryVariableOptions(variable, searchFilter));
        resolve();
      });
    },
  });
