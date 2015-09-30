# my-grid
AngularJS directive for a table grid.

The table is configured through an object with properties to column contents which allows flexibility in what is displayed based on the data provided.

A main feature of this grid is the ability to display multi-line text in one or more columns of a row.

A sample is provided in the 'sample' folder which contains the html, css and js files required for it to display.  A server is required for Angular operations.

## Grid Configuration
The following elements pre-configure the table content which is built at runtime with live data.

### Column Definitions
The table columns are configured via the 'columnDefs' array of objects.  Each object defines one column with the following property items:

- 'label'
  - The column header label
- 'field'
  - Name of json data property to be displayed in the column.
- 'width'
  - Size of the column width, expressed in normal CSS manner. (px, em, %, etc.)
- 'isMultiline' (optional)
  - Boolean value indicating that the column will display wrapped text (as many lines as required to display all of the data).
  - Defaults to a single line (truncating data at maximum column width defined)
- 'cellRenderer' (optional)
  - A function called with the data which either returns html string, or calls a user function to build the html string.
    - User function parameters contain the column field name and the data passed to it at runtime.
  - Only the first parameter has to be modified, to match the field name (same as 'field' property).
- 'isHidden' (optional)
  - Boolean value indicating that this column is not visible, but can be used in filtering of rows via Angular filter.

####Example:
This example has 6 columns, 5 of which are visible.  The first column displays a custom cell content and the 4th column contains multi-line data.

```
var columnDefs = [
    { label: "Type",         field: "eventType",   width: "7%",  isMultiline: false, sort: true, cellRenderer: function(data){return buildCellHtml('eventType', data);} },
    { label: "Severity",     field: "severity",    width: "7%",  isMultiline: false, sort: true },
    { label: "Route",        field: "road",        width: "13%", isMultiline: false, sort: true },
    { label: "Description",  field: "description", width: "58%", isMultiline: true,  sort: true },
    { label: "Last Updated", field: "lastUpdated", width: "15%", isMultiline: false, sort: true },
    { label: "District",     field: "district",    width: "0%",  isHidden: true}
];
```

### Cell Renderer Function
When the cell must be rendered using custom html for its content (i.e. image), the 'cellRenderer' property is defined in the columnDefs configuration.

The value of the property will be the same for any column, except for the first parameter in the call to 'buildCllHtml' which has to be the field name of the data.  This value serves two purposes.  The first is to locate the appropriate object in the 'cellRendererProps' array to be used and the data property to be used should any 'match' properties be provided which can be used to display varying html specific to the data row.  Alternatively, a set html string can be defined (defaultHtml) which will instead be rendered for all occurances.

The cellRenderer value is: 
	function(data){return buildCellHtml('fieldName', data);}

The 'fieldName' parameter should be changed to match the field property value in the cellRendererProps array.  If there are no matches to be performed against the data, this value does not have to be a valid property name from the data object, but it does have to match against one of the cellRendererProps to determine which html string to render.

### Cell Rendering Properties
This property is only required if a 'cellRenderer' property is defined in the 'columnDefs' configuration.

The renderer is an anonymous function that passes through the row data to be evaluated by the 'buildCellHtml' function.  That function passes the data along as well as 
the field name which is to be used in the build process to determine which property block should be used.

The fields of a renderer object are as follows:
- 'field'
    - Text to be used to match this object with the one required by the cellRenderer function (the 1st parameter)
- 'matchHtml'
  - The html string to be rendered upon a match between the field value and the matching.value item.
  - This html may contain placeholders which are replaced with other property values.
  - Placeholders are defined with surrounding '@' symbols and use one of the property names in the 'matching' object
    -'defaultHtml'
      - Default html to be used when no field data match is found.
 	  - If empty string, will return field value as default.
    - 'matching'
      - An array of objects containing a 'value' property to compare to the in data value.
      - All other properties are optional and used to replace the associated placeholders in the matchHtml string with the property value.
      - If there are no objects in array, the 'defaultHtml' will be used rather than the 'matchingHtml'.
      - The object properties are:
        - 'value'
          - Case insensitive value to match against the field data.
          - Other properties are only used to replace placeholders in 'matchHtml' with the same name, surrounded by '@' characters.


####Example:

This example has one member which matches the json 'eventType' property.  It provides 3 possible values to match against specifically using the 'value' property.
A 'image' property is provided to be inserted into the html string for 'matchHtml'.
No default html is provided (used when no matches found) so the json data value will be output by default.

```
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
```

## Build

Run 'npm install' to install dependencies.

The preview (under 'sample') requires a server such as jekyll, grunt, etc. to be running for it to display properly in a browser.

## Testing

(not implemented)
