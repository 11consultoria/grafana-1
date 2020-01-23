import React, { MouseEvent, PureComponent } from 'react';
import debounce from 'lodash/debounce';
import { Subscription } from 'rxjs';
import { ClickOutsideWrapper } from '@grafana/ui';
import { e2e } from '@grafana/e2e';

import { VariableHide, VariableOption } from '../variable';
import { dispatch } from '../../../store/store';
import {
  hideQueryVariableDropDown,
  selectVariableOption,
  showQueryVariableDropDown,
  toVariablePayload,
} from '../state/actions';
import { QueryVariableState } from '../state/queryVariableReducer';
import { variableAdapters } from '../adapters';
import { subscribeToVariableChanges } from '../subscribeToVariableStateChanges';
import { VariableProps } from './VariablePicker';

export interface Props extends VariableProps {}

export class QueryVariablePicker extends PureComponent<Props, QueryVariableState> {
  private readonly debouncedOnQueryChanged: Function;
  private readonly subscription: Subscription = null;
  constructor(props: Props) {
    super(props);
    this.debouncedOnQueryChanged = debounce((searchQuery: string) => {
      this.onQueryChanged(searchQuery);
    }, 200);
    this.subscription = subscribeToVariableChanges<QueryVariableState>(props.name, 'query').subscribe({
      next: state => {
        if (this.state) {
          this.setState({ ...state });
          return;
        }

        this.state = state;
      },
    });
  }

  componentDidMount(): void {}

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<QueryVariableState>): void {}

  componentWillUnmount(): void {
    this.subscription.unsubscribe();
  }

  onShowDropDown = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    event.preventDefault();
    dispatch(showQueryVariableDropDown(toVariablePayload(this.state.variable)));
  };

  selectValue = (option: VariableOption, event: MouseEvent<HTMLAnchorElement>, commitChange = false) => {
    event.stopPropagation();
    event.preventDefault();
    if (!option) {
      return;
    }

    dispatch(
      selectVariableOption(toVariablePayload(this.state.variable, { option, forceSelect: commitChange, event }))
    );
  };

  commitChanges = () => {
    const { queryHasSearchFilter, oldVariableText } = this.state.picker;

    if (queryHasSearchFilter) {
      // this.updateLazyLoadedOptions();
    }

    if (this.state.variable.current.text !== oldVariableText) {
      variableAdapters.get(this.state.variable.type).setValue(this.state.variable, this.state.variable.current);
    }
    dispatch(hideQueryVariableDropDown(toVariablePayload(this.state.variable)));
  };

  onQueryChanged = (searchQuery: string) => {};

  onCloseDropDown = () => {
    this.commitChanges();
  };

  render() {
    const {
      linkText,
      selectedTags,
      searchQuery,
      showDropDown,
      selectedValues,
      highlightIndex,
      tags,
      options,
    } = this.state.picker;

    if (!this.state.variable) {
      return <div>Couldn't load variable</div>;
    }

    const { name, hide, multi } = this.state.variable;
    let { label } = this.state.variable;

    label = label || name;
    return (
      <div className="gf-form">
        {hide !== VariableHide.hideLabel && (
          <label
            className="gf-form-label template-variable"
            aria-label={e2e.pages.Dashboard.SubMenu.selectors.submenuItemLabels(label)}
          >
            {label}
          </label>
        )}
        {hide !== VariableHide.hideVariable && (
          <div className="variable-link-wrapper">
            {!showDropDown && (
              <a
                onClick={this.onShowDropDown}
                className="variable-value-link"
                aria-label={e2e.pages.Dashboard.SubMenu.selectors.submenuItemValueDropDownValueLinkTexts(`${linkText}`)}
              >
                {linkText}
                {selectedTags.map(tag => {
                  return (
                    <span bs-tooltip="tag.valuesText" data-placement="bottom" key={`${tag.text}`}>
                      {/*<span className="label-tag" tag-color-from-name="tag.text">*/}
                      <span className="label-tag">
                        &nbsp;&nbsp;<i className="fa fa-tag"></i>&nbsp; {tag.text}
                      </span>
                    </span>
                  );
                })}
                <i className="fa fa-caret-down" style={{ fontSize: '12px' }}></i>
              </a>
            )}

            {showDropDown && (
              <ClickOutsideWrapper onClick={this.onCloseDropDown}>
                <input
                  ref={instance => {
                    if (instance) {
                      instance.focus();
                      instance.setAttribute('style', `width:${Math.max(instance.width, 80)}px`);
                    }
                  }}
                  type="text"
                  className="gf-form-input"
                  value={searchQuery}
                  onChange={event => this.debouncedOnQueryChanged(event.target.value)}
                  // inputEl.css('width', Math.max(linkEl.width(), 80) + 'px');
                  // ng-keydown="vm.keyDown($event)"
                  // ng-model="vm.search.query"
                  // ng-change="vm.debouncedQueryChanged()"
                />
              </ClickOutsideWrapper>
            )}

            {showDropDown && (
              <ClickOutsideWrapper onClick={this.onCloseDropDown}>
                <div
                  className={`${multi ? 'variable-value-dropdown multi' : 'variable-value-dropdown single'}`}
                  aria-label={e2e.pages.Dashboard.SubMenu.selectors.submenuItemValueDropDownDropDown}
                >
                  <div className="variable-options-wrapper">
                    <div className="variable-options-column">
                      {multi && (
                        <a
                          className={`${
                            selectedValues.length > 1
                              ? 'variable-options-column-header many-selected'
                              : 'variable-options-column-header'
                          }`}
                          // bs-tooltip="'Clear selections'"
                          data-placement="top"
                          // ng-click="vm.clearSelections()"
                        >
                          <span className="variable-option-icon"></span>
                          Selected ({selectedValues.length})
                        </a>
                      )}
                      {options.map((option, index) => {
                        const selectClass = option.selected
                          ? 'variable-option pointer selected'
                          : 'variable-option pointer';
                        const highlightClass = index === highlightIndex ? `${selectClass} highlighted` : selectClass;
                        return (
                          <a
                            key={`${option.value}`}
                            className={highlightClass}
                            onClick={event => this.selectValue(option, event)}
                            // ng-click="vm.selectValue(option, $event)"
                          >
                            <span className="variable-option-icon"></span>
                            <span
                              aria-label={e2e.pages.Dashboard.SubMenu.selectors.submenuItemValueDropDownOptionTexts(
                                `${option.text}`
                              )}
                            >
                              {option.text}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                    {tags.length > 0 && (
                      <div className="variable-options-column">
                        <div className="variable-options-column-header text-center">Tags</div>
                        {tags.map((tag, index) => {
                          return (
                            <a
                              key={`${tag.text}`}
                              className={`${
                                tag.selected ? 'variable-option-tag pointer selected' : 'variable-option-tag pointer'
                              }`}
                              // ng-click="vm.selectTag(tag, $event)"
                            >
                              <span className="fa fa-fw variable-option-icon"></span>
                              <span
                                className="label-tag"
                                // tag-color-from-name="tag.text"
                              >
                                {tag.text}&nbsp;&nbsp;<i className="fa fa-tag"></i>&nbsp;
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </ClickOutsideWrapper>
            )}
          </div>
        )}
      </div>
    );
  }
}
