import angular, { ILocationService } from 'angular';
import _ from 'lodash';
import { e2e } from '@grafana/e2e';

import { VariableSrv } from 'app/features/templating/all';
import { CoreEvents } from '../../../../types';
import { variableAdapter, VariableModel } from '../../../templating/variable';
import { store } from '../../../../store/store';
import { getVariables } from '../../../templating/state/selectors';

export class SubMenuCtrl {
  annotations: any;
  variables: VariableModel[];
  dashboard: any;
  submenuEnabled: boolean;
  selectors: typeof e2e.pages.Dashboard.SubMenu.selectors;

  /** @ngInject */
  constructor(private variableSrv: VariableSrv, private $location: ILocationService) {
    this.annotations = this.dashboard.templating.list;
    const variablesInState = getVariables(store.getState()).map(variable => ({ ...variable }));
    this.variables = this.variableSrv.variables.concat(variablesInState).sort((a, b) => a.index - b.index);
    this.submenuEnabled = this.dashboard.meta.submenuEnabled;
    this.dashboard.events.on(CoreEvents.submenuVisibilityChanged, (enabled: boolean) => {
      this.submenuEnabled = enabled;
    });
    this.selectors = e2e.pages.Dashboard.SubMenu.selectors;
  }

  annotationStateChanged() {
    this.dashboard.startRefresh();
  }

  variableUpdated(variable: VariableModel) {
    if (variableAdapter[variable.type].useState) {
      return;
    }
    this.variableSrv.variableUpdated(variable, true);
  }

  openEditView(editview: any) {
    const search = _.extend(this.$location.search(), { editview: editview });
    this.$location.search(search);
  }
}

export function submenuDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/SubMenu/template.html',
    controller: SubMenuCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      dashboard: '=',
    },
  };
}

angular.module('grafana.directives').directive('dashboardSubmenu', submenuDirective);
