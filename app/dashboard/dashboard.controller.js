DashCtrl.$inject = ['$scope', '$http', '$mdDialog', 'WidgetInstances', 'AddWidgetController'];

export default function DashCtrl($scope, $http, $mdDialog, WidgetInstances, AddWidgetController) {
	$scope.rerender = true;
	//TODO rename to visualisablePipelines
	var possibleVisualizations = [];

	$http.get('/visualization/_all_docs?include_docs=true')
		.success(function(data) {
			possibleVisualizations = data.rows;

			// get the names for each pipeline
			angular.forEach(possibleVisualizations, function(vis) {
				$http.get('/pipeline/' + vis.doc.pipelineId)
					.success(function(pipeline) {
						vis.doc.name = pipeline.name;
					});
			});
		});


	$scope.addSpWidget = function(layoutId) {
		$mdDialog.show({
			controller: AddWidgetController,
			templateUrl: 'app/dashboard/add-widget-template.html',
			parent: angular.element(document.body),
			clickOutsideToClose:true,
			locals : {
				possibleVisualizations: possibleVisualizations,
				rerenderDashboard: rerenderDashboard,
				layoutId: layoutId
			}
		});
	};

	$scope.removeSpWidget = function(widget) {
		WidgetInstances.remove(widget.attrs['widget-id']);
		rerenderDashboard();
	};


	// TODO Helper to add new Widgets to the dashboard
	// Find a better solution
	var rerenderDashboard = function() {
		$scope.rerender = false;
		setTimeout(function() {
			$scope.$apply(function () {
				getOptions().then(function(options) {
					$scope.layoutOptions = options;
					$scope.rerender = true;
				});
			});
		}, 100);
	}

	var getLayoutWidgets = function(layoutId, widgets) {
		return _.filter(widgets, function(w) {
			return w.layoutId == layoutId;h
		});
	}
	

	var getOptions = function() {
		return WidgetInstances.getAllWidgetDefinitions().then(function(widgets) {
			return 	{
				widgetDefinitions: widgets,
				widgetButtons: false,
				defaultLayouts: [
					{ title: 'Layout 1', id: 'layout_1', active: true , defaultWidgets: getLayoutWidgets('layout_1', widgets)},
					{ title: 'Layout 2', id: 'layout_2', active: false, defaultWidgets: getLayoutWidgets('layout_2', widgets)},
				]
			}
		});
	};


	$scope.layoutOptions = {
				widgetDefinitions: [],
				widgetButtons: false,
			};

	rerenderDashboard();

};
