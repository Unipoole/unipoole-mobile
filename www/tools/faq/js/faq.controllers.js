'use strict';


$(document).ready(function(){
	$('.tree-toggle').click(function () {
		$(this).parent().children('ul.tree').toggle(200);
	});
});

/**
 * Faq list controller
 */
synthMobile.controller('FaqListCtrl', 
	['$scope', '$rootScope', 'FaqService', 'SynthErrorHandler', 
    function($scope, $rootScope, FaqService, SynthErrorHandler) {
		
		$rootScope.activePage="faqs";
		$rootScope.breadcrumbs = [{'name' : 'FAQs'}];
		
		/**
	     * Adds the boolean parent indicator to identify the parent nodes
	     * 
	     * @param {Object} faqData
	     */
	    function prepareFaqData(faqData) {
	        var displayData = [];
	        for (var key in faqData) {
	            faqData[key].isParent = faqData[key].id === faqData[key].parentId;
	            if (faqData[key].isParent) {
	                displayData.push(faqData[key]);
	                addChildren(faqData[key], faqData);
	            }
	        }
	        return displayData;
	    }

	    /**
	     * Add the children for a parent node
	     * 
	     * This is done to get the corret diaply order for the tree table
	     * 
	     * @param {type} parentId
	     * @param {type} faqData
	     * @param {type} displayData
	     */
	    function addChildren(parent, faqData) {
	        for (var key in faqData) {
	            if (faqData[key].parentId === parent.id && faqData[key].id !== parent.id) {
	            	parent.children = parent.children || [];
	            	parent.children.push(faqData[key]);
	            }
	        }
	    }
		
		// Put all the Faqs on the UI
	    FaqService
	    	.getFaqs()
	    	.then(function(faqs) {
		        $scope.faqs = prepareFaqData(faqs);
		    },SynthErrorHandler);
    }
])

/**
 * Faq Detail controller
 */
.controller('FaqDetailCtrl', 
	['$scope','$rootScope', '$routeParams', 'FaqService', 'SynthErrorHandler', 
    function($scope, $rootScope, $routeParams, FaqService, SynthErrorHandler) {
		$rootScope.activePage="faqs";
		$rootScope.breadcrumbs = [{'name' : 'FAQs', 'url' : '#/tool/faq'}];
		
        // Get the specific faq
        FaqService.getFaq($routeParams.faqId)
        	.then(function(faq) {
        		FaqService
        			.getFaq(faq.parentId)
	        		.then(function(parentFaq){
	            		faq.category = parentFaq.description;
	            		$rootScope.breadcrumbs = [{'name' : 'FAQs', 'url' : '#/tool/faq'}, {'name' : faq.category}];
	            		$scope.faq = faq;
	            	},SynthErrorHandler);
        		
        	},SynthErrorHandler);
    }
]);