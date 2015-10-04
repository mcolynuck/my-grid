(function(MyGrid, undefined){

	'use strict';

	/** ========== START OF CONFIGURATION AREA ============== **/

    var jsonUrl = "/data.json";		// JSON data to load into grid table


    // Table content configuration
    // label - Text label for column header
    // field - Field the column data relates to
    // width - Size of column (px, em, %, etc.)
    // isMultiline - Will column display wrapped text over one or more lines?
    // cellRenderer - A function called with the data which either returns html string, or calls a user function to build the html string.
    //				- User function parameters contain the column field name and the data passed to it at runtime.
    // isHidden - Boolean to hide column. Column can be used for sorting even though not visible to user.
    var columnDefs = [
// Could add min/max width, sort comparator function, filtering, etc.
        { label: "Type",         field: "eventType",   width: "7%",  isMultiline: false, sort: true, cellRenderer: function(data){return buildCellHtml('eventType', data);} },
        { label: "Severity",     field: "severity",    width: "7%",  isMultiline: false, sort: true },
        { label: "Route",        field: "road",        width: "13%", isMultiline: false, sort: true },
        { label: "Description",  field: "description", width: "58%", isMultiline: true,  sort: true },
        { label: "Last Updated", field: "lastUpdated", width: "15%", isMultiline: false, sort: true },
        { label: "District",     field: "district",    width: "0%",  isHidden: true}     // Filtering on this so need to load it and hide from view.
    ];



    /**
     * Cell renderer properties
     *
     * An array of objects used to render an html string at runtime for a column based on the data for that row.
     *
     * Properties:
     *		field 	 - The field name used to match this object with the column to be rendered (see columnDefs for details)
     *		matchHtml- The html string to be rendered upon a match of data field values.
     *            	 - The html may contain placeholders to be populated based on the match.
     *            	 - Placeholders are the property name, surrounded by '@' characters on both ends.
     *      defaultHtml  - Default html if no match is found.
     *				 - If empty string, will return field value as default.
     *		matching - An array of objects containing a 'value' property which is used to determine which object to use to build the html.
     *				 - If no objects in array, defaultHtml will be returned instead of matchHtml.
     *			Properties:
     *				value - Case insensitive value to match that columns data field with.
     *				Any other properties are used to populate the html string placeholders which have the same name as the property, surrounded by '@'.
     */
    var cellRendererProps = [						// Array of objects
    	{
	    	field: "eventType",						// Column field name
	    	matchHtml: '<img src="@image@" title="@value@" alt="@value@"/>',		// Html to render with @xxx@ placeholders substituted for matching property values.
	    	defaultHtml : '',						// Empty string means return field value instead if no match found.
	    	matching: [								// Conditional data to match and hold placeholder data
		    	{
		    		value: "incident",				// Field value to match against
		    		image: "images/incident.png"	// Placeholder data for html string to be used.
		    	}, {
		    		value: "future planned",
		    		image: "images/blue-cone.png"
		    	}, {
		    		value: "road conditions",
		    		image: "images/road.png"
		    	}
	    	]
	    }
    ];

	/** ========== END OF CONFIGURATION AREA ============== **/


    /**
     * Builds the html string based on row data and cellRendererProps.
     */
	var buildCellHtml = function(fieldName, data){
		var defaultHtml = "";
		for (var x=0; x < cellRendererProps.length; x++) {										// fields
			if(fieldName == cellRendererProps[x].field) {
				defaultHtml = cellRendererProps[x].defaultHtml;
				var html = cellRendererProps[x].matchHtml,
					matching = cellRendererProps[x].matching;

				for (var y=0; y < matching.length; y++){										// matching
					// Match property condition value to data column value
					if(matching[y].value.toLowerCase() == data[fieldName].toLowerCase()) {
						for (var prop in matching[y]) {
							html = html.replace("@"+prop+"@", matching[y][prop]);
						}
						return html;
					}				
				}
				break;		// No other fields will match, so skip out of loop now.
			}
		}

		// No match so try defaultHtml
		if (defaultHtml.length > 0) {
			return defaultHtml
		}

		// If all else fails, return field value.
		return data[fieldName];
	};



	/**
	 * @ngdoc function
	 * @name Grid
	 * @description
	 * # my-grid
	 * Directives for gridCtrl
	 */
	angular.module('my-grid', ['ngSanitize'])	// Sanitize required for cellRenderer option.

	  /**
	   * @ngdoc controller
	   * @name my-grid.controller:ListCtrl
	   * @description
	   * # ListCtrl
	   * Controller of the drivebcApp List page.
	   * Defines radio & checkboxes and table configuration options used by various directives to generate the page.
	   */
	  .controller('GridCtrl', ['$scope', '$http', '$sce', '$q', 'gridFilter', function ($scope, $http, $sce, $q, gridFilter) {


		/**
		 * @ngdoc function
		 * @name loadExternalData
		 * @description
		 * Load external data for the grid and filtering options.
		 * defer.process called at end of loading event data as it is the largest data file.
		 */
		function loadExternalData (defer, url){
		    $http.get(url).
		      success(function(data) { 
		        defer.resolve(data);    // Resolve promise
		    }).
		    error(function(msg){
		      throw "Error loading data. " + msg;
		      defer.reject();
		    });
		    return defer.promise;				
		}



		// Configure the image to display in a column, if properties provided.
		// for (var i = 0; i < columnDefs.length; i++){
		// 	if (columnDefs[i].cellRendererProps) {
		// 		columnDefs[i].cellRenderer = $sce.trustAsHtml(setColumnImage($scope.data, columDefs[i].cellRendererProps));}	
		// 	}
		// }

	    $scope.gridOptions = {
	        columnDefs: columnDefs,     // Column display and meta information
	        rowData: null,              // Retreived in http.get call from external source
	        filterService: gridFilter   // Service to communicate selections between directive and filter
	    };


	    // Load external json data
	    loadExternalData($q.defer(), jsonUrl)
	    	.then(function(data){
		      // Update grid data
		      $scope.gridOptions.rowData = data;
	    	})
	    ;
	  
	  }])

	/**
	 * @ngdoc directive
	 * @name my-grid.directive:myGrid
	 * @description
	 * # grid_directives
	 * Directives for grid data table on List page.
	 */
	.directive('myGrid', function() {		// Data table grid
	    return {
	        restrict: 'A',
	        templateUrl: "my-grid-template.html",
	        scope: {
	        	gridOptions: "="
	        },

			/**
			 * @ngdoc controller
			 * @name drivebcApp.module:grid_directives
			 * @description
			 * # grid_directives
			 * Controller for grid directive to handle column sorting.
			 */	        
	        controller: function($scope){
	        	$scope.curSortCol = "";				// Column currently sorting by
	        	$scope.isDescendingSort = false;	// Is column sorted in descending order?	        	
	  			$scope.sortColumnMessage = "Click on column header to apply sorting, click again to reverse order";


	        	$scope.setSortBy = function(column){
	        		var colDef = null;
	        		for (var x=0; x < $scope.gridOptions.columnDefs.length; x++) {
	        			if ($scope.gridOptions.columnDefs[x].field === column) {
	        				colDef = $scope.gridOptions.columnDefs[x];	// Shorten var name for ease of use

			        		// Does this column have sorting functionality configured?
			        		if (colDef.sort !== 'undefined') {
				        		if (colDef.sort === true) {
					        		// Check first if gridOptions.columnDefs.sort is true for this field
					        		if ($scope.curSortCol === column){
					        			// Flip sort ordering
					        			if ($scope.isDescendingSort) {	// Sort ascending
					        				$scope.isDescendingSort = false;
						        			$scope.sortCol = $scope.curSortCol;
					        			} else {					// Sort descending
					        				$scope.isDescendingSort = true;
						        			$scope.sortCol = '-' + $scope.curSortCol;
					        			}
					        		} else {
					        			$scope.isDescendingSort = false;		// New column sort has ascending by default
					        			$scope.sortCol = column;
					        		}
					        		
					        		// TODO: If sorting, do they provide the sorting function?

					        		// Save for later use
					        		$scope.curSortCol = column;
				        		} else {
				        			// Not sortable as defined by user.
				        		}
			        		} else {
			        			// No sorting option defined, so default to not allowing it.
			        		}
	        			}
	        		}
	        	};
	        }
	    };
  	})


	/**
	 * @ngdoc filter
	 * @name my-grid.filter:gridFilter
	 * @description
	 * # grid_directives
	 * Filters grid data based on filter service values
	 */
	.filter('gridFilter', function () {		// Custom filter
		return function (data, filterService) {

			if(data && data.length > 0){	// Any data to filter?

				var resultArray = [],								// What we will return
					filterObj = filterService.getFilterObject(),	// What we filter against
					resultObj = {};									// Hash list to prevent duplicates from multliple filters matching a record

				if(filterObj && Object.keys(filterObj).length > 0) {	// Anything to filter with?

					for(var i=0; i < data.length; i++){			// Loop over data and compare with filter
						for (var field in filterObj) {
							try {
								if(typeof data[i][field] === 'string') {
									if(filterObj[field].indexOf(data[i][field].toLowerCase()) >= 0){		// Does column value match filter value?
										resultObj[i] = data[i];
									}
								} else {	// Assume array
									for(var item in data[i][field]) {
										if(filterObj[field].indexOf(data[i][field][item].toLowerCase()) >= 0){		// Does column value match filter value?
											resultObj[i] = data[i];
										}										
									}
								}
							} catch (err) {
								console.log("data: ",data[i]);
								console.error("field: ["+field+"]  loop: "+i+"  filterObj:",filterObj);
								console.error(err);
								return data;
							}
						}
					}
					for (var key in resultObj){				// Put hash list into array format for return.
						resultArray.push(resultObj[key]);
					}
				} else {
					resultArray = data;		// No filter or filter has no data to filter with yet.
				}
			} else {
				resultArray = [];	// No data provided so return empty array.
			}

			return resultArray;			
		};
	})


	  /**
	   * @ngdoc service
	   * @name my-grid.service:gridFilter
	   * @description
	   *
	   * Provides service to maintain filter options for use in filtering grid table.
	   * Data is stored in an object with an array of values for each named property.
	   * A property can hold 1 or more values.
	   * The property name is same as the grid field name as configured in the grid table options.
	   *
	   * @Example
	   *	// Configure the table content
	   * 	var columnDefs = [
       *        { label: "Employee",  field: "name",    width: "20%",  isMultiline: false, sort: true },
       *        { label: "Address",   field: "address", width: "80%",  isMultiline: true,  sort: true },
       *	];
       *
	   *	// Add a filter value to the 'name' column filter.
	   *	filter.updateFilterByName("name", "Bob", true);
	   *
	   */
	  .service('gridFilter', function() {

	    var filterObject = {};    // Contains filter properties (grid field name) and array of values (lower-case versions)
	                              // i.e. { "eventType": ["incident", "current construction"]}

	    // Adds a value to a property if not an empty value.
	    this.updateFilterByName = function(propertyName, value, isAdding) {
	// console.log("** updateFilterByName =============");
	      var tempObj = filterObject;     // Make changes to a copy then back when done.

	      if(propertyName && propertyName.trim().length > 0 && value && value.trim().length > 0) {
	        if(isAdding) {
	          if(!tempObj.hasOwnProperty(propertyName)) {
	            tempObj[propertyName] = [];    // Add new empty property so we can add to it.
	          }

	          if(tempObj[propertyName].indexOf(value) < 0) {
	            tempObj[propertyName].push(value);
	          }
	        } else {
	          if (tempObj.hasOwnProperty(propertyName)) {   // Does this property exist to have a value removed?
	            var i = 0;
	            if((i = tempObj[propertyName].indexOf(value)) >= 0) {
	              tempObj[propertyName].splice(i, 1);

	              // Remove property if there are no values left.
	              if (tempObj[propertyName].length === 0) {
	                delete tempObj[propertyName];
	              }
	            }
	          }
	        }
	      }
	      filterObject = tempObj;     // Copy modified data back to filter object.
	    };


	    // Change content of filter for a property in one shot with prepopulated array of values.
	    this.bulkUpdateFilterByName = function(propertyName, data) {
	      filterObject[propertyName] = data;
	    };


	    // Removes property from filter object
	    this.clearFilterByName = function(propertyName) {
	      delete filterObject[propertyName];
	    }


	    // Get specific filter property array data
	    this.getFilterArrayByName = function(propertyName) {
	      if(propertyName && filterObject[propertyName]) {
	        return filterObject[propertyName];
	      }
	      return [];    // Not found, so return empty array.
	    };


	    // Get filter object with all filtering data
	    this.getFilterObject = function() {
	      return filterObject;
	    }
	  })
	;	

}(window.MyGrid = window.MyGrid || {} ));