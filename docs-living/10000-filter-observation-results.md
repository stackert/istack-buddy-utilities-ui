## Filter and Display Observation Result

### Discussion

Ultimately we'll have a page with a few action buttons: 'create logic/calc stash', 'restore logic/calc stash', 'uniquely identify fields', etc. This same page will contain a 'form view' an iframe whose srcdoc is the html of the form we are working with.

On this page we will display the results of an Observation Maker. The Observation Messages are expected to be about 200-300. Most of those are uninteresting. We will provide a filter option to make it easier to find the interesting messages.

We will allow filter by:

- field type
- ELogLevel
- hasLogic
- hasCalculation
- subjectType (form, field, email, submitAction, ...)

We will also provide a free-text search box to search all entire messages.

We will have a panel to display all visible messages. Visibility is determined by if it meets the filter/search options.

### How it works

When the page loads it will immediately load the given formId.
It will use the formJson to create a form model. It will use a ObservationMaker to run observations of the using the formModel. All observation messages will be displayed in the ObservationsList. The user will select various filter options to display various messages.
If a user select ELogLevel.DEBUG and enters 12377793 in the search box, only debug message, with the text of 12377793 will be displayed. If a user selects ELogLevel.DEBUG will be displayed.

### TO start

We will use CompositeFormLogicObservationMaker to make observations. We will load test-data/forms-json/5375703.json (and pretend we fetched from the server.)

ALL WE WANT IS THE FILTER BOX AND THE OBSERVATION MESSAGE LIST. We will get this in good working order before proceed to anything else.

Please use components.

We will use state (I believe) we already are

### References

- docs-living/observation-makers.md
