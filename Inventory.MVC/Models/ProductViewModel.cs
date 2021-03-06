﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.MVC.Resources;
using System.ComponentModel.DataAnnotations.Schema;
using Inventory.MVC.Attributes;
using Inventory.DAL;

namespace Inventory.MVC.Models
{
    //http://www.telerik.com/forums/foreignkey-column-does-not-produce-dropdown-list-in-popup-editing
    public class ProductViewModel : ViewModelBase
    {
        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_Name_Name")]
        public string Name { get; set; }

        [Required(ErrorMessageResourceType = typeof(ViewModelResources),
            ErrorMessageResourceName = "RequiredErrorMessage")]
        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_Code_Name",
            ShortName = "ProductViewModel_Code_ShortName",
            Prompt = "ProductViewModel_Code_Prompt",
            Description = "ProductViewModel_Code_Description")]
        public string Code { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_UnitPrice_Name")]
        public decimal? UnitPrice { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_UnitsInStock_Name")]
        public decimal? UnitsInStock { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_UnitsOnOrder_Name")]
        public decimal? UnitsOnOrder { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_ReorderLevel_Name")]
        public decimal? ReorderLevel { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
          Name = "ProductViewModel_SellStartDate_Name")]
        [DataType(DataType.Date)]
        public DateTime? SellStartDate { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
          Name = "ProductViewModel_SellEndDate_Name")]
        [DataType(DataType.Date)]
        public DateTime? SellEndDate { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_CategoryId_Name")]
        [UIHint("GridForeignKey")]
        [RelationAttribute(EntityType = typeof(ProductCategory), DataTextField = "Name", DataValueField = "Id", PropertyNameInViewModel="Category")]
        [AdditionalMetadata("modelType", "ProductCategoryViewModel")]
        public long? CategoryId { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_UnitMeasureId_Name")]
        [UIHint("GridForeignKey")]
        [RelationAttribute(EntityType = typeof(ProductUnitMeasure), DataTextField = "Name", DataValueField = "Id", PropertyNameInViewModel="UnitMeasure")]
        [AdditionalMetadata("modelType", "ProductUnitMeasureViewModel")]
        public long? UnitMeasureId { get; set; }

        [Display(ResourceType = typeof(ViewModelResources),
            Name = "ProductViewModel_StoreId_Name")]
        [UIHint("GridForeignKey")]
        [RelationAttribute(EntityType = typeof(ProductStore), DataTextField = "Name", DataValueField = "Id", PropertyNameInViewModel = "Store")]
        [AdditionalMetadata("modelType", "ProductStoreViewModel")]
        public long? StoreId { get; set; }

        [HiddenInput(DisplayValue = false)]
        public ProductCategoryViewModel Category { get; set; }

        [HiddenInput(DisplayValue = false)]
        public ProductUnitMeasureViewModel UnitMeasure { get; set; }

        [HiddenInput(DisplayValue = false)]
        public ProductStoreViewModel Store { get; set; }
    }
}