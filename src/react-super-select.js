// © Scotland Stephenson 2015

// - [github](https://github.com/alsoscotland/react-super-select)
// - [documentation](http://alsoscotland.github.io/react-super-select/)
// - freely distributed under the MIT license.

var _ = require('lodash'),
    classNames = require('classnames'),
    React = require('react');

// Dependencies
//  - [Lodash](https://lodash.com/)
//  - [classnames](https://www.npmjs.com/package/classnames)
//  - [React](https://facebook.github.io/react/index.html)

var ReactSuperSelect = React.createClass({

// Properties
// ------
  propTypes: {

    // BOOLEAN OPTIONS
    // ---------------

    // **multiple** (Boolean) *optional*  - Whether or not the control supports multi-selection. When using the **tags** display option, this option is redundant
    multiple: React.PropTypes.bool,
    // **searchable** (Boolean) *optional* - Whether or not to show a search bar in the dropdown area which offers text-based filtering of the **dataSource** options (by label key)
    searchable: React.PropTypes.bool,
    // **tags** (Boolean) *optional* - Whether or not to display your chosen multi-select values as tags.  (When set, there is no need to set the **multiple** option)
    tags: React.PropTypes.bool,

    // CSS CLASS / CUSTOM STYLING SUPPORT OPTIONS
    // -----------------------------------

    // **customClass** (String) *optional* - This value will be added as a css class to the control's main wrapping element.  You should be able to overide all styling by leading your rules with
    // ```css
    // .r-ss-wrap.{customClass}
    // ```
    customClass: React.PropTypes.string,

    // **customGroupHeadingClass** (String) *optional* - Used in conjunction with the **groupBy** option.  The string value will be added as a custom css class to the group headings which are rendered into the dropdown
    customGroupHeadingClass: React.PropTypes.string,

    // **customSearchIconClass** (String) *optional* - This value will be added as a css class to the icon element in the search-filtering bar (when **searchable** is true).  Allowing you to override the default search icon (default: a magnifying glass)
    customSearchIconClass: React.PropTypes.string,

    // **customLoaderClass** (String) *optional* - Used in conjunction with the **ajaxDataFetch** option.  This string value will be added as a css class to the loading icon (default: an animated gif spinner as base64 background image in css) allowing css overrides.
    customLoaderClass: React.PropTypes.string,

    // **customTagClass** (String) *optional* - Used in conjunction with the **tags** option.  This value will be added as a css class to the wrapper of a selection displayed as a tag. You should be able to overide all tag styling by leading your css rules with
    // ```css
    //  .r-ss-tag.{customTagClass}
    //  ```
    customTagClass: React.PropTypes.string,

    // MAIN CHANGE HANDLER
    // -------------------

    // **onChange** (Function) *required* - This is the main callback handler for the control.  When a user makes selection(s), this handler will be called, the selected option (or when **multiple** or **tags** an array of selected values) will be passed to the handler as an argument.  (The values passed are option objects from the dataSource collection)
    onChange: React.PropTypes.func.isRequired,

    // OPTION DATA-RELATED PROPS
    // -------------------------

    // **ajaxDataFetch** (Function) (*optional - but **dataSource** must be supplied if undefined*) - Your select dropdown's data may be fetched via ajax if you provide a function as the value for this option.
    // The function takes no arguments, but it must return a **promise** object. (i.e. an object with a then function).  The promise must resolve with a value meeting the description of the **dataSource** option documentation. The **dataSource** option should be left undefined when using this option.
    ajaxDataFetch: React.PropTypes.func,

    // **dataSource** (Array|Object|Collection Object) (*optional - but **ajaxDataFetch** must be supplied if undefined*) - The dataSource option provides the data for your options dropdown.
    // The value provided will go to an internal parser (_configureDataSource), which will return a collection (array of option objects) found based on argument type

    //  The parsing method supports dataSource values as:
    //  - an array of option objects (will be directly assigned to state.data)
    //  - an object with a collection property (object.collection will be assigned to state.data)
    //  - an object with a get function (the return value of object.get('collection') will be assigned to state.data)

    //  Each option in the resulting collection must have the following properties:
    //  - a unique value corresponding to the key set by the **optionValueKey** or the default optionValueKey of **id**
    //  - a defined value corresponsing to the key set by the **optionLabelKey** or the default optionLabelKey of **name**
    dataSource: React.PropTypes.oneOfType([
              React.PropTypes.arrayOf(React.PropTypes.object),
              React.PropTypes.object
            ]),

    // **optionLabelKey** (String) (*optional - defaults to using 'name' as the key if undefined*) - This value represents the key in each option object (from the **dataSource** collection), which represents the value you would like displayed for each option.
    optionLabelKey: React.PropTypes.string,

    // **optionValueKey** (String) (*optional - defaults to using 'id' as the key if undefined*) - This value represents the key in each option object (from the **dataSource** collection), which represents the value that **uniquely identifies** that option across the **dataSource** collection.  Think of it in terms of the value attribute of a traditional html `<select>` element
    optionValueKey: React.PropTypes.string, // value this maps to should be unique in data source

    // **pageDataFetch** (Function) *optional* (A *hasMorePages* function should be provided when using this option) - Additional pages of data can be fetched  via ajax if you provide a function as the value for this option.
    // The function takes one argument, the value provided as the **dataSource** (or the return value of the **ajaxDataSource** function).
    // It must return a **promise** object. (i.e. an object with a then function). The promise must resolve with a value meeting the description of the **dataSource** option documentation.
    // The pageDataFetch function will be called based upon the user's scroll position in the dropdown.
    // *It will not be called when loading ajax data, or when filtering results in a searchable dropdown, or when **hasMorePages** evaluates to false
    pageDataFetch: React.PropTypes.func,

    // **hasMorePages** (Function) *optional* (should be provided when using the *pageDataFetch* option) - A function that accepts one argument, a value as described by the *dataSource* option documentation, and returns a Boolean value.
    // The value should indicate whether the option data collection has any more pages available for fetching
    hasMorePages: React.PropTypes.func,

    // GROUPING FUNCTIONALITY
    // ----------------------

    // **groupBy** (String|Object|Function) *optional* - Allows you to sort your dropdown options into groups by leveraging Lodash's groupBy function.  Please reference the [Lodash](https://lodash.com/docs#groupBy) documentation for behavior of *groupBy* when passed different argument types
    groupBy: React.PropTypes.oneOfType([
              React.PropTypes.string,
              React.PropTypes.func,
              React.PropTypes.object
            ]),

    // **customGroupHeadingTemplateFunction** (Function) *optional* (Used in conjunction with the **groupBy** option) - This function provides custom templating capability for your dropdown heading options.  The function should accept the value returned as each group's object key (returned by the call of Lodash's groupBy when passed the value of your **groupBy** option)
    customGroupHeadingTemplateFunction: React.PropTypes.func,

    // RENDERING (OPTION ITERATOR) FUNCTIONS
    // -------------------------------------

    // **customFilterFunction** (Function) *optional* - Used in conjunction with the **searchable** option.  The function provided will serve as a replacement of the default search filter function.
    // When left undefined the default filter function will be used.
    //(Defaults To: A lowercase string comparison for text.  Matches the **optionLabelKey** value to the text entered into the dropdown's search field).  The function is leveraged by [Lodash's filter function](https://lodash.com/docs#filter) with your **dataSource** collection as its first argument.
    customFilterFunction: React.PropTypes.func,

    // **customOptionTemplateFunction** (Function) *optional* - This function provides custom templating capability for your dropdown options and the display of selected values.  The function should accept a single option object from your **dataSource** collection and return your desired markup based on that object's properties.
    customOptionTemplateFunction: React.PropTypes.func,

    // LOCALIZATION STRINGS
    // --------------------

    // **ajaxErrorString** (String) *optional* - (Used in conjunction with the **ajaxDataFetch** & **pageDataFetch** options) This string will be shown in the dropdown area when an ajax request fails
    ajaxErrorString: React.PropTypes.string,

    // **noResultsString** (String) *optional* - A string value which will be displayed when your dropdown shows no results.  (i.e. dataSource is an empty collection, or ajaxDataFetch returns an empty collection)
    noResultsString: React.PropTypes.string,

    // **placeholder** (String) *optional* - This string value will be displayed in the main display area of your control when the user has no selected values
    placeholder: React.PropTypes.string,

    // **searchPlaceholder** (String) *optional* - (Used in conjunction with the **searchable** option) This string will be shown in the dropdown area's search input field when a user has not entered any characters.
    searchPlaceholder: React.PropTypes.string
  },

  // CONSTANTS
  // ---------

  // used as the focusedID state variable value, when the search input field of a **searchable** control has focus.
  SEARCH_FOCUS_ID: -1,

  // regular expression used to determine if event src options have selected class
  SELECTED_OPTION_REGEX: /r-ss-selected/,

  // Default string values for localization options
  DEFAULT_LOCALIZATIONS: {
    ajaxErrorString: 'An Error occured while fetching options',
    noResultsString: 'No Results Available',
    placeholder: 'Select an Option',
    searchPlaceholder: 'Search'
  },

  // STATE VARIABLES
  // ---------------
  getInitialState: function() {
    return {
      // **ajaxError** (Boolean) - Set to true when an ajax request fails
      ajaxError: false,

      // **controlId** (String) - A unique identifier for the rss control. This value is used to generate aria accessibility labels
      controlId: _.uniqueId('rss_'),

      // **data** (Array of Objects) the active dataSource collection used to map to option elements, with any search filtering results reflected
      data: this._configureDataSource(this.props.dataSource),

      // **rawDataSource** (Object|Array) The raw dataSource value the user supplies through the *dataSource* prop (or returned from *ajaxDataFetch* / *pageDataFetch*). This value is passed to the *pageDataFetch* callback
      rawDataSource: this.props.dataSource,

      // **isOpen** (Boolean) - Whether or not the dropdown is open
      isOpen: false,

      // **focusedId** (Number) - Used to track keyboard focus for accessibility
      focusedId: undefined,

      // **labelKey** (String) - The option object key that will be used to identify the value displayed as an option's label
      labelKey: this.props.optionLabelKey || 'name',

      // **lastOptionId** (Number) - Used in keyboard navigation to focus the last available option in the dropdown
      lastOptionId: (_.isArray(this.props.dataSource) && (this.props.dataSource.length > 0)) ? this.props.dataSource.length - 1 : undefined,

      // **searchString** (String) - When the **searchable** option is true, this is the user-entered value in the search field. It is used for data filtering based on the label key's value
      searchString: undefined,

      // **value** (Array) - An array that holds the current user-selected option(s)
      value: [],

      // **valueKey** (String) - The option object key that will be used to identify the value used as an option's value property (values must be unique across data source)
      valueKey: this.props.optionValueKey || 'id'
    };
  },

  // KEYMAP CONSTANT
  // ------
  // A text-based lookup for keyboard navigation keys and their corresponding 'which' keycode values
  keymap: {
    'down': 40,
    'end': 35, // goto last option ?
    'enter': 13,
    'esc': 27,
    'home': 36, // go to first option ?
    'left': 37,
    'right': 39,
    'space': 32,
    'tab': 9,
    'up': 38
  },

  // NON-STATE VARS (no need to re-render based on these being set)

  // **lastUserSelectedOptionData** - A store of the last user-selected option, used for accesibility-related option focusing, as well as shift-click selection
  lastUserSelectedOption: undefined,

  // **mouseMomentum** (Number) (1|-1) - Used in shift-click selection to determine direction for traversal of options
  mouseMomentum: 1,

  // If parent page updates the data source, reset the control with some defaults and the new dataSource.
  componentWillReceiveProps: function(nextProps) {
    if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {

      this.lastUserSelectedOption = undefined;
      this.mouseMomentum = 1;

      this.setState({
        data: this._configureDataSource(nextProps.dataSource),
        rawDataSource: nextProps.dataSource,
        focusedId: undefined,
        labelKey: nextProps.optionLabelKey || 'name',
        lastOptionId: (_.isArray(nextProps.dataSource) && (nextProps.dataSource.length > 0)) ? nextProps.dataSource.length - 1 : undefined,
        valueKey: nextProps.optionValueKey || 'id'
      });
    }
  },

  // Update focused element after re-render
  componentDidUpdate: function() {
    this._focusCurrentFocusedId();
  },

  // main render method
  render: function() {
    var dropdownContent = this._getDropdownContent(),
        placeholderString,
        triggerDisplayContent,
        triggerClasses,
        caratClass = classNames('carat', {
          'down': !this.state.isOpen,
          'up': this.state.isOpen
        }),
        wrapClasses;

    wrapClasses = classNames("r-ss-wrap", this.props.customClass, {
      'r-ss-expanded': this.state.isOpen
    });

    triggerClasses = classNames('r-ss-trigger', {
      'r-ss-open': this.state.isOpen,
      'r-ss-placeholder': this.state.value.length < 1
    });

    placeholderString = this.props.placeholder ? this.props.placeholder : this.DEFAULT_LOCALIZATIONS.placeholder;
    triggerDisplayContent = this.state.value.length ? this._generateValueDisplay() : placeholderString;

    return (
      <div ref="rssControl" id={this.state.controlId} className={wrapClasses}>
        <div ref="triggerDiv"
           className={triggerClasses}
           onClick={this.toggleDropdown}
           onKeyDown={this._handleKeyDown}
           role="combobox"
           aria-activedescendant={this._ariaGetActiveDescendentId()}
           aria-haspopup={true}
           aria-controls={this._ariaGetListId()}
           aria-label={placeholderString}
           aria-multiselectable={this._isMultiSelect()}
           tabIndex="1">
            {triggerDisplayContent}
            <span ref="carat" className={caratClass}> </span>
        </div>
        {dropdownContent}
      </div>);
  },

  // toggles the open-state of the dropdown
  // sets focused option in callback after opening
  toggleDropdown: function() {
    this.setState({
      'isOpen': !this.state.isOpen
    }, function() {
      if (this.state.isOpen) {
        this._setFocusOnOpen();
      }
    });
  },

  // returns the unique DOM id for the currently focused option. Used for accessibility-related labeling
  _ariaGetActiveDescendentId: function() {
    var ariaActiveDescendantId = null,
        optionRef = this._getFocusedOptionKey();
    if (this.refs[optionRef]) {
      ariaActiveDescendantId = this.refs[optionRef].props.id;
    }
    return ariaActiveDescendantId;
  },

  // calculate the unique identifier for the options ul for aria compliance labeling usage
  _ariaGetListId: function() {
    return this.state.controlId + '_list';
  },

  // close the dropdown
  // resets focus to the main control trigger
  _closeOnKeypress: function() {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false
      }, this._focusTrigger);
    }
  },

  // overloaded dataSource parser (Object|Array)
  // case: (object) - look for a collection property which is an array, or runs an existing 'get' function, get('collection'), and determines if the return value is an array
  // case: (Array) - return the dataSource array for use as this.state.data
  _configureDataSource: function(dataSource) {
    if (_.isArray(dataSource)) {
     return dataSource;
    }

    if (_.isObject(dataSource)) {
      if (_.isArray(dataSource.collection)) {
        return dataSource.collection;
      }

      if (_.isFunction(dataSource.get)) {
        var collection = dataSource.get('collection');
        if (_.isArray(collection)) {
          return collection;
        }
      }
    }

    return [];
  },

  // Used if no **customFilterFunction** provided for filtering the data options shown in a **searchable** control.
  // Runs a lowercase string comparison with the **searchString** and the value corresponding to an option's **optionLabelKey**
  _defaultSearchFilter: function(option) {
    var search = this.state.searchString.toLowerCase();
    if (!_.isString(option[this.state.labelKey])) {
      return false;
    }
    return option[this.state.labelKey].toLowerCase().indexOf(search) > -1;
  },

  // fetch data source via ajax if **ajaxDataFetch** function provided
  // handles success and failure for ajax call
  _fetchDataViaAjax: function() {
    var self = this;
    this.props.ajaxDataFetch(this.state.rawDataSource).then(function(dataSourceFromAjax) {
      self.setState({
        ajaxError: false,
        data: self._configureDataSource(dataSourceFromAjax),
        rawDataSource: dataSourceFromAjax
      });
    }, function() {
      self.setState({
        ajaxError: true,
        // define as empty array on error so that _needsAjaxFetch will evaluate to false
        rawDataSource: []
      });
    });
  },

  // Fetch the next page of options data if **pageDataFetch** function provided.
  // Called onMouseMove if scroll position in dropdown exceeds threshold.
  // Handles success and failure for ajax call
  _fetchNextPage: function() {
    var self = this;
    this.props.pageDataFetch(this.state.rawDataSource).then(function(dataSourceFromPageFetch) {
      self.setState({
        ajaxError: false,
        data: self._configureDataSource(dataSourceFromPageFetch),
        rawDataSource: dataSourceFromPageFetch,
        isFetchingPage: false
      });
    }, function() {
        self.setState({
          ajaxError: true
        });
    });
  },

  // choose the appropriate search filter function and run the filter against the options data
  _filterDataBySearchString: function(data) {
    var filterFunction = _.isFunction(this.props.customFilterFunction) ? this.props.customFilterFunction : this._defaultSearchFilter;
    return _.filter(data, filterFunction);
  },

  // used when selecting values, returns an array of full option-data objects which contain any single value, or any one of an array of values passed in
  _findArrayOfOptionDataObjectsByValue: function(value) {
    var valuesArray = _.isArray(value) ? _.pluck(value, this.state.valueKey) : [value];
    return _.reject(this.state.data, function(item) {
      return !_.contains(valuesArray, item[this.state.valueKey]);
    }, this);
  },

  // determine whether to focus a option value in the DOM, or the search field
  _focusCurrentFocusedId: function() {
    if (this.state.focusedId < 0) {
      this._focusSearch();
      return;
    }

    this._focusDOMOption();
  },

  // focus the DOM option identified by the current state.focusedId
  _focusDOMOption: function() {
    var optionRef = this._getFocusedOptionKey();
    if (this.refs[optionRef]) {
      if (_.isFunction(this.refs[optionRef].getDOMNode().focus)) {
        this.refs[optionRef].getDOMNode().focus();
      }
    }
  },

  // focus the dropdown's search field if it exists
  _focusSearch: function() {
    if (this.refs.searchInput) {
      this.refs.searchInput.getDOMNode().focus();
    }
  },

  // focus the main trigger element of the control
  _focusTrigger: function() {
    if (this.refs.triggerDiv) {
      this.refs.triggerDiv.getDOMNode().focus();
    }
  },

  // choose whether to template the display of user-selected values normally, or as tags
  _generateValueDisplay: function() {
    if (!this.props.tags) {
      return this._getNormalDisplayMarkup();
    } else {
      return this._getTagsDisplayMarkup();
    }
  },

  // render the content shown if an ajax error occurs
  _getAjaxErrorMarkup: function() {
    var errorString = this.props.ajaxErrorString ? this.props.ajaxErrorString : this.DEFAULT_LOCALIZATIONS.ajaxErrorString;
    return (<li className="r-ss-dropdown-option error"><i ref="errorDisplay">{errorString}</i></li>);
  },

  // calculate and return the renderable data source object or array, factoring in the search filtering, and any grouping functionality
  _getDataSource: function() {
    var data = _.isArray(this.state.data) ? this.state.data : [];
    if (_.isString(this.state.searchString)) {
      data = this._filterDataBySearchString(data);
    }

    if (this.props.groupBy) {
      data = _.groupBy(data, this.props.groupBy);
    }

    return data;
  },

  // build and render the dropdown content
  // will trigger the **ajaxDataFetch** fetch (and show loader) if needed
  _getDropdownContent: function() {
    if (!this.state.isOpen) {
      return null;
    }

    var searchContent = this._getSearchContent(),
        mouseMoveHandler,
        pagingLi;

    mouseMoveHandler = (this.props.pageDataFetch) ? this._onMouseMove : null;
    pagingLi = this.state.isFetchingPage ? this._getPagingLi() : null;

    return(
      <div ref="dropdownContent" className="r-ss-dropdown" onKeyDown={this._handleKeyDown}>
        {searchContent}
        <div ref="scrollWrap" className="r-ss-options-wrap" onMouseMove={mouseMoveHandler}>
          <ul className="r-ss-dropdown-options"
              ref="dropdownOptionsList"
              tabIndex="-1"
              id={this._ariaGetListId()}
              role="listbox"
              aria-expanded={this.state.isOpen}>
            {this._getOptionsMarkup()}
          </ul>
          {pagingLi}
        </div>
      </div>
    );
  },

  // build the string used as a React component ref for each focusable option
  _getFocusedOptionKey: function() {
    return 'option_' + this.state.focusedId;
  },

  // render a group heading, used if **groupBy** option is provided.
  // renders a non-focusable list item for an option group heading
  _getGroupHeadingMarkup: function(heading) {
    if (!heading) {
      return null;
    }

    var headingClasses = classNames("r-ss-option-group-heading", this.props.customGroupHeadingClass),
        headingKey = "heading_" + heading,
        headingMarkup = this.props.customGroupHeadingTemplateFunction ? this.props.customGroupHeadingTemplateFunction(heading) : heading;

    return(
      <li tabIndex="-1" className={headingClasses} key={headingKey} role="separator">
        {headingMarkup}
      </li>);
  },

  // render the content shown when no options are available
  _getNoResultsMarkup: function() {
    var noResultsString = this.props.noResultsString ? this.props.noResultsString : this.DEFAULT_LOCALIZATIONS.noResultsString;
    return (<li className="r-ss-dropdown-option" tabIndex="-1"><i ref="noResults">{noResultsString}</i></li>);
  },

  // Render the selected options into the trigger element using the normal (i.e. non-tags) behavior.
  // Choose whether to render using the default template or a provided **customOptionTemplateFunction**
  _getNormalDisplayMarkup: function() {
    return _.map(this.state.value, function(value) {
      if (this.props.customOptionTemplateFunction) {
        return this.props.customOptionTemplateFunction(value);
      } else {
        return value[this.state.labelKey];
      }
    }, this);
  },

  // render a loading span (spinner gif), with **customLoaderClass** if provided
  _getLoadingMarkup: function() {
    var loaderClasses = this.props.customLoaderClass ? "r-ss-loader " + this.props.customLoaderClass : "r-ss-loader";
    return (<span ref="loader" className={loaderClasses}></span>);
  },

  // get the option Li element from a passed eventTarget.
  // for key events = event.target
  // for click events = event.currentTarget
  _getOptionIndexFromTarget: function(targetLi) {
    return parseInt(targetLi.getAttribute('data-option-index'), 10);
  },

  // render the data source as options,
  // render loading if fetching
  // render ajaxError markup when state.ajaxError is true
  // - when **groupBy** is set, data will be a javascript object.  Run with group heading renders in that case
  // - must track options count to maintain a single focusable index mapping across multiple groups of options
  _getOptionsMarkup: function() {
    if (this._needsAjaxFetch()) {
      this._fetchDataViaAjax();
      return this._getPagingLi();
    }

    if (this.state.ajaxError) {
      return this._getAjaxErrorMarkup();
    }

    var data = this._getDataSource(),
        options = [],
        optionsCount = 0;

    if (!_.isArray(data)) {
      _.forIn(data, function(groupedOptions, heading) {
        options.push(this._getGroupHeadingMarkup(heading));
        options = options.concat(this._getTemplatedOptions(groupedOptions, optionsCount));
        optionsCount = optionsCount + groupedOptions.length;
      }, this);
    } else {
      options = this._getTemplatedOptions(data);
    }

    return options;
  },

  // render a list item with a loading indicator.  Shown while **pageDataFetch** or **ajaxDataFetch** functions run
  _getPagingLi: function() {
    return(<li key="page_loading" className="r-ss-page-fetch-indicator" tabIndex="-1">
            {this._getLoadingMarkup()}
          </li>);
  },

  // render a search input bar with a search icon
  // - add localized **searchPlaceholder** if provided
  // - add **customIconClass** if provided
  _getSearchContent: function() {
    if (!this.props.searchable) {
      return null;
    }

    var magnifierClass = this.props.customSearchIconClass ? this.props.customSearchIconClass : "r-ss-magnifier",
        searchPlaceholderString = this.props.searchPlaceholder ? this.props.searchPlaceholder : this.DEFAULT_LOCALIZATIONS.searchPlaceholder,
        searchAriaId = this.state.controlId + '_search',
        searchAriaIdLabel = searchAriaId + '_label';

    return(
      <div className="r-ss-search-wrap">
        <div className="r-ss-search-inner">
          <label ref="searchInputLabel" id={searchAriaIdLabel} className="r-ss-search-aria-label" htmlFor={searchAriaId}>{searchPlaceholderString}</label>
          <input ref="searchInput"
                 placeholder={searchPlaceholderString}
                 onKeyUp={this._handleSearch}
                 onClick={this._setFocusIdToSearch}
                 defaultValue={this.state.searchString}
                 name={searchAriaId}
                 id={searchAriaId}
                 aria-labelledby={searchAriaIdLabel}
                 aria-owns={this._ariaGetListId()}
                 aria-autocomplete="list" />
          <i className={magnifierClass}>search</i>
        </div>
      </div>
    );
  },

  // iterate over selected values and build tags markup for selected options display
  _getTagsDisplayMarkup: function() {
    return _.map(this.state.value, function(value) {
      return this._getTagMarkup(value);
    }, this);
  },

  // render a tag for an individual selected value
  // - add **customTagClass** if provided
  _getTagMarkup: function(value) {
    var label = value[this.state.labelKey],
        displayValue = value[this.state.valueKey],
        tagKey = 'tag_' + displayValue,
        buttonName = "RemoveTag_" + displayValue,
        tagWrapClass = this.props.customTagClass ? "r-ss-tag " + this.props.customTagClass : "r-ss-tag";

    return (
      <span className={tagWrapClass} key={tagKey}>
        <span className="r-ss-tag-label">{label}</span>
        <button name={buttonName} type="button" className="r-ss-tag-remove" onClick={this._removeTagClick.bind(null, value)} onKeyDown={this._removeTagKeyPress.bind(null, value)}>X</button>
      </span>);
  },

  // choose a rendering function, either **customOptionTemplateFunction** if provided, or default
  // - render no results markup if no options result from map calls
  _getTemplatedOptions: function(data, indexStart) {
    indexStart = indexStart || 0;
    var options = this._mapDataToOptionsMarkup(data, indexStart);

    if (options.length === 0) {
      options = this._getNoResultsMarkup();
    }

    return options;
  },

  // main keyDown binding handler for keyboard navigation and selection
  _handleKeyDown: function(event) {
    if (this.state.isOpen || (event.which !== this.keymap.tab)) {
      event.stopPropagation();
      event.preventDefault();
    }

    switch(event.which) {
      case this.keymap.down:
        this._onDownKey(event);
        break;
      case this.keymap.end:
        this._onEndKey();
        break;
      case this.keymap.enter:
        this._onEnterKey(event);
        break;
      case this.keymap.esc:
        this._onEscKey();
        break;
      case this.keymap.home:
        this._onHomeKey();
        break;
      case this.keymap.space:
        this._onEnterKey(event); // delegate to enter
        break;
      case this.keymap.tab: // delegate to enter (selection) handler
        if (this.state.isOpen) {
          this._onEnterKey(event);
        }
        break;
      case this.keymap.up:
        this._onUpKey(event);
        break;
    }
  },

  // handler for searchInput's keyUp event
  _handleSearch: function(event) {
    var searchString = event.target.value;
    this._handleSearchDebounced.call(this, searchString);
    this._handleKeyDown(event);
  },

  // debounced handler for searchInput's keyUp event, reduces # of times the control re-renders
  _handleSearchDebounced: _.debounce(function(search) {
    this.setState({
      searchString: search
    });
  }, 300),

  // return the boolean used to determine whether an option should have the 'r-ss-selected' class
  _isCurrentlySelected: function(dataItem) {
    if (!_.isArray(this.state.value)) {
      return _.isEqual(this.state.value, dataItem);
    }
    return !!(_.findWhere(this.state.value, dataItem));
  },

  // tags and mutiple both provide multi-select behavior.  Returns true if either is set to true
  _isMultiSelect: function() {
    return this.props.multiple || this.props.tags;
  },

  // Render the option list-items.
  // Leverage the **customOptionTemplateFunction** function if provided
  _mapDataToOptionsMarkup: function(data, indexStart) {
    return _.map(data, function(dataOption, index) {
      index = indexStart + index;

      var isCurrentlySelected = this._isCurrentlySelected(dataOption),
          itemKey = "drop_li_" + dataOption[this.state.valueKey],
          indexRef = 'option_' + index,
          ariaDescendantId = this.state.controlId + '_aria_' + indexRef,
          optionMarkup = _.isFunction(this.props.customOptionTemplateFunction) ? this.props.customOptionTemplateFunction(dataOption) : dataOption[this.state.labelKey],
          classes = classNames('r-ss-dropdown-option', {
            'r-ss-selected': isCurrentlySelected
          });

      return (
        <li ref={indexRef}
            id={ariaDescendantId}
            tabIndex="0"
            data-option-index={index}
            className={classes}
            aria-selected={isCurrentlySelected}
            key={itemKey}
            data-option-value={dataOption[this.state.valueKey]}
            onClick={this._selectItemOnOptionClick.bind(null, dataOption)}
            onMouseEnter={this._trackMouseMomentum}
            role="option">
          {optionMarkup}
        </li>);
    }, this);
  },

  // determines next focusedId prior to updateFocusedId call
  _moveFocusDown: function() {
    if (this._needsAjaxFetch()) {
      return;
    }
    var nextId;

    if (_.isUndefined(this.state.focusedId)) {
      if (this.props.searchable) {
        nextId = this.SEARCH_FOCUS_ID;
      } else {
        nextId = 0;
      }
    } else {
      nextId = (this.state.lastOptionId === this.state.focusedId) ? this.state.lastOptionId : this.state.focusedId + 1;
    }

    this._updateFocusedId(nextId);
  },

  // determines previous focusedId prior to updateFocusedId call
  _moveFocusUp: function() {
    var previousId;

    if (!_.isUndefined(this.state.focusedId) && (this.state.focusedId !== this.SEARCH_FOCUS_ID)) {
      if (this.state.focusedId === 0) {
        if (this.props.searchable) {
          previousId = this.SEARCH_FOCUS_ID;
        }
      } else {
        previousId = this.state.focusedId - 1;
      }
    }
    this._updateFocusedId(previousId);
  },

  // return boolean to determine if we have already received data from the **ajaxDataFetch** function
  _needsAjaxFetch: function() {
    return (_.isUndefined(this.state.rawDataSource) && _.isFunction(this.props.ajaxDataFetch));
  },

  // down key handler
  // shift-keypress is used to select successive focus items for aria keyboard accessibility
  _onDownKey: function(event) {
    if (!this.state.isOpen) {
      this.toggleDropdown();
      return;
    }

    this._moveFocusDown();
    if (this._isMultiSelect() && event.shiftKey) {
      this._selectFocusedOption(event.target, true);
    }
  },

  // end key handler. Move focus to the last available option
  _onEndKey: function() {
    if (this.state.lastOptionId) {
      this._updateFocusedId(this.state.lastOptionId);
    }
  },

  // Enter key handler.
  // Opens the control when closed.
  // Otherwise, makes selection
  _onEnterKey: function(event) {
    if (!this.state.isOpen) {
      this.toggleDropdown();
      return;
    }

    if (this._isMultiSelect() && event.shiftKey) {
      this._selectAllOptionsToLastUserSelectedOption(event.target);
      return;
    }

    var keepControlOpen = (this._isMultiSelect() && (event.ctrlKey || event.metaKey));
    this._selectFocusedOption(event.target, keepControlOpen);
  },

  // Escape key handler. Closes the dropdown
  _onEscKey: function() {
    this._closeOnKeypress();
  },

  // Home key handler. Moves focus to the first available option
  _onHomeKey: function() {
    this._updateFocusedId(0);
  },

  // mouse move handler used when **pageDataFetch** is set. It will fire the pageDataFetch function if the user has scrolled sufficiently far in the dropdown
  _onMouseMove: function() {
    // do not fetch page if searching or already loading data
    if (this.refs.loader || this.state.searchString || !this._pageFetchingComplete()) {
      return;
    }

    var wrap = this.refs.scrollWrap.getDOMNode();

    if ((wrap.scrollTop + wrap.offsetHeight) >= wrap.scrollHeight) {
      this.setState({
        isFetchingPage: true
      }, this._fetchNextPage);
    }
  },

  // Up key handler.
  // Shift-click is used to select successive focus items for aria keyboard accessibility
  _onUpKey: function(event) {
    if (event.altKey) {
      this._closeOnKeypress();
      return;
    }

    if (this.state.isOpen) {
      this._moveFocusUp();
      if (this._isMultiSelect() && event.shiftKey) {
        this._selectFocusedOption(event.target, true);
      }
    }
  },

  // If hasMorePages option (Function) present, returns the value of its call.
  // Otherwise, returns false so page fetch will not occur
  _pageFetchingComplete: function() {
    if (!_.isFunction(this.props.hasMorePages)) {
      return false;
    } else {
      return this.props.hasMorePages(this.state.rawDataSource);
    }
  },

  // Used in shift selection when the event target was previously selected.
  // Remove all options up to, but not including the option that raised the event.
  // (So it behaves like a native browser form multi-select)
  _removeAllOptionsInOptionIdRange: function(from, to) {
    var valuePropsToReject = [];

    for (var i = from; i <= to; i++) {
      var refString = 'option_' + i,
      option = this.refs[refString];
      if (this.SELECTED_OPTION_REGEX.test(option.props.className)) {
        // do not remove the item the user shift-clicked, this is the way browser default shift-click behaves in multi-select
        if (parseInt(this.lastUserSelectedOption.getAttribute('data-option-value'),10) !== option.props['data-option-value']) {
          valuePropsToReject.push(option.props['data-option-value']);
        }
      }
    }

    var remainingSelected = _.reject(this.state.value, function(option) {
        return _.includes(valuePropsToReject, option[this.state.valueKey]);
      }, this);

    this.props.onChange(remainingSelected);

    this.setState({
      value: remainingSelected
    });
  },

  // Remove an item from the state.value selected items array.
  // The *value* arg represents a full dataSource option object
  _removeSelectedOptionByValue: function(value) {
    // clear lastUserSelected if has been removed
    if (this.lastUserSelectedOption && (this.lastUserSelectedOption.getAttribute('data-option-value') === value[this.state.valueKey])) {
      this.lastUserSelectedOption = undefined;
    }

    var SelectedAfterRemoval = _.reject(this.state.value, function(option) {
              return option[this.state.valueKey] === value[this.state.valueKey];
            }, this);

    this.props.onChange(SelectedAfterRemoval);

    this.setState({
      value: SelectedAfterRemoval
    });
  },

  // remove a selected tag on keyDown
  _removeTagKeyPress: function(value, event) {
    event.preventDefault();
    event.stopPropagation();

    var isEnterKey = event.which === this.keymap.enter,
        isSpaceKey = event.which === this.keymap.space;

    if (isEnterKey || isSpaceKey) {
      this._removeSelectedOptionByValue(value); // delegate to removal handler
    }
  },

  // remove a selected tag on click
  _removeTagClick: function(value, event) {
    event.preventDefault();
    event.stopPropagation();

    this._removeSelectedOptionByValue(value);
  },

  // used in shift-click range selections
  _selectAllOptionsInOptionIdRange: function(from, to) {
    var valuePropsToSelect = [];
    for (var i = from; i <= to; i++) {
      var refString = 'option_' + i,
      option = this.refs[refString];
      if (!this.SELECTED_OPTION_REGEX.test(option.props.className)) {
        valuePropsToSelect.push(option.props['data-option-value']);
      }
    }

    var optionsToSelect = _.reduce(this.state.data, function(memo, option) {
          if (_.includes(valuePropsToSelect, option[this.state.valueKey])) {
            memo.push(option);
          }
          return memo;
        }, [], this);
    this._selectItemByValues(optionsToSelect, true);
  },

  // Used in shift-key selection.
  // Select all options from the current eventTarget to the lastUserSelectedOption, based on mouseMomentum
  _selectAllOptionsToLastUserSelectedOption: function(eventTargetLi) {
    if (!this.lastUserSelectedOption) {
      this.lastUserSelectedOption = eventTargetLi;
      // select all options from the first option to the clicked option
      this._selectAllOptionsInOptionIdRange(0, this._getOptionIndexFromTarget(eventTargetLi));
      return;
    }
    var to,
        from;

    if (this.mouseMomentum === 1) {
      // Traversing up the list towards the last option.
      // Select all options up from last user selected until event target option
      from = this._getOptionIndexFromTarget(this.lastUserSelectedOption);
      to = this._getOptionIndexFromTarget(eventTargetLi);
    } else {
      // Traversing down the list towards first option.
      // Select all options down from the event target option to the last user selected option
      from = this._getOptionIndexFromTarget(eventTargetLi);
      to = this._getOptionIndexFromTarget(this.lastUserSelectedOption);
    }

    // if the option was already selected, this should trigger a removal operation, otherwise trigger an add
    if (this.SELECTED_OPTION_REGEX.test(eventTargetLi.getAttribute('class'))) {
      this.lastUserSelectedOption = eventTargetLi;
      this._removeAllOptionsInOptionIdRange(from, to);
    } else {
      this.lastUserSelectedOption = eventTargetLi;
      this._selectAllOptionsInOptionIdRange(from, to);
    }
  },

  // Make a user-selection of the option that is currently focused.
  // Will close the dropDown when keepControlOpen is falsy
  _selectFocusedOption: function(eventTargetLi, keepControlOpen) {
    keepControlOpen = keepControlOpen || false;

    var focusedOptionKey = this._getFocusedOptionKey();
    if (this.refs[focusedOptionKey]) {
      var optionValue = this.refs[focusedOptionKey].props['data-option-value'];

      // store as last userSelected
      this.lastUserSelectedOption = eventTargetLi;

      if (keepControlOpen && this.SELECTED_OPTION_REGEX.test(this.refs[focusedOptionKey].props.className)) {
        var optionFullFromValueProp = _.first(this._findArrayOfOptionDataObjectsByValue(optionValue));
        this._removeSelectedOptionByValue(optionFullFromValueProp);
      } else {
        this._selectItemByValues(optionValue, keepControlOpen);
      }
    }
  },

  // Handle selection of an option or array of options.
  // Track last selection the user made.
  // Close dropdown on the setState callback if not a non control-closing selection
  _selectItemByValues: function(value, keepControlOpen) {
   var objectValues = this._findArrayOfOptionDataObjectsByValue(value);

    if (this._isMultiSelect() || (keepControlOpen && this.state.value)) {
      objectValues = this.state.value.concat(objectValues);
    }

    var outputValue = this._isMultiSelect() ? objectValues : _.first(objectValues);
    this.props.onChange(outputValue);

    if (keepControlOpen) {
      this.setState({
        value: objectValues
      });
    } else {
      this.setState({
        value: objectValues
      }, this._closeOnKeypress);
    }
  },

  // handle option-click (ctrl or meta keys) when selecting additional options in a multi-select control
  _selectItemOnOptionClick: function(value, event) {
    if (this._isMultiSelect() && event.shiftKey) {
      this._selectAllOptionsToLastUserSelectedOption(event.currentTarget);
      return;
    }
    var keepControlOpen = (this._isMultiSelect() && (event.ctrlKey || event.metaKey));

    // store clicked option as the lastUserSelected
    this.lastUserSelectedOption = event.currentTarget;

    if (keepControlOpen && this.SELECTED_OPTION_REGEX.test(event.currentTarget.getAttribute('class'))) {
      this._removeSelectedOptionByValue(value);
    } else {
      this._selectItemByValues(value[this.state.valueKey], keepControlOpen);
    }
  },

  // set the focusId to the SEARCH_FOCUS_ID constant value
  _setFocusIdToSearch: function() {
    this._updateFocusedId(this.SEARCH_FOCUS_ID);
  },

  // if lastUserSelectedOption is populated, focus it, otherwise moveFocusDown
  _setFocusOnOpen: function() {
    if (this.lastUserSelectedOption) {
      this._updateFocusedId(parseInt(this.lastUserSelectedOption.getAttribute('data-option-index'), 10));
    } else {
      this._moveFocusDown();
    }
  },

  // Used for shift selection.
  // Sets direction the user is heading from the lastUserSelectedOption
  _trackMouseMomentum: function(event) {
    var mouseOverOptionId = this._getOptionIndexFromTarget(event.currentTarget);
    if (!this.lastUserSelectedOption) {
      this.mouseMomentum = 1;
    } else {
      this.mouseMomentum = (mouseOverOptionId >= this._getOptionIndexFromTarget(this.lastUserSelectedOption)) ? 1 : -1;
    }
  },

  // Sets the current focusedId.
  _updateFocusedId: function(id) {
    this.setState({
      focusedId: id
    });
  }

});

module.exports = ReactSuperSelect;