using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.MVC.Models;
//using Kendo.Mvc.UI;
using Kendo.DynamicLinq;
using Kendo.Mvc.Extensions;
using Microsoft.AspNet.SignalR;
using Inventory.DAL;
using StructureMap;
using Inventory.MVC.Infrastructure;
using Microsoft.AspNet.SignalR.Hubs;

namespace SignalRLocalHub.Hubs
{
    [HubName("crudHub")]
    public class CrudHub : Hub
    {
        public ProductViewModel CreateProduct(ProductViewModel product)
        {
            ProductViewModel createdProductViewModel = Utils.CreateBase<Product, ProductViewModel>(product);
            Clients.Others.createProduct(createdProductViewModel);
            return createdProductViewModel;
        }

        public IEnumerable<ProductViewModel> ReadProduct()
        {
            var productViewModels = Utils.ReadBase<Product, ProductViewModel>().AsEnumerable();
            return productViewModels;
        }

        public void UpdateProduct(ProductViewModel product)
        {
            var updatedProductViewModel = Utils.UpdateBase<Product, ProductViewModel>(product);
            Clients.Others.updateProduct(updatedProductViewModel);
        }

        public void DestroyProduct(ProductViewModel product)
        {
            var deletedProductViewModel = Utils.DeleteBase<Product, ProductViewModel>(product);
            Clients.Others.destroyProduct(deletedProductViewModel);
        }

        public ProductCategoryViewModel CreateProductCategory(ProductCategoryViewModel product)
        {
            ProductCategoryViewModel createdProductCategoryViewModel = Utils.CreateBase<ProductCategory, ProductCategoryViewModel>(product);
            Clients.Others.createProductCategory(createdProductCategoryViewModel);
            return createdProductCategoryViewModel;
        }

        public IEnumerable<ProductCategoryViewModel> ReadProductCategory()
        {
            var productCategoryViewModels = Utils.ReadBase<ProductCategory, ProductCategoryViewModel>().AsEnumerable();
            return productCategoryViewModels;
        }

        public void UpdateProductCategory(ProductCategoryViewModel product)
        {
            var updatedProductCategoryViewModel = Utils.UpdateBase<ProductCategory, ProductCategoryViewModel>(product);
            Clients.Others.updateProductCategory(updatedProductCategoryViewModel);
        }

        public void DestroyProductCategory(ProductCategoryViewModel productCategory)
        {
            var deletedProductCategoryViewModel = Utils.DeleteBase<ProductCategory, ProductCategoryViewModel>(productCategory);
            Clients.Others.destroyProductCategory(deletedProductCategoryViewModel);
        }

        public ProductUnitMeasureViewModel CreateProductUnitMeasure(ProductUnitMeasureViewModel product)
        {
            ProductUnitMeasureViewModel createdProductUnitMeasureViewModel = Utils.CreateBase<ProductUnitMeasure, ProductUnitMeasureViewModel>(product);
            Clients.Others.createProductUnitMeasure(createdProductUnitMeasureViewModel);
            return createdProductUnitMeasureViewModel;
        }

        public IEnumerable<ProductUnitMeasureViewModel> ReadProductUnitMeasure()
        {
            var productUnitMeasureViewModels = Utils.ReadBase<ProductUnitMeasure, ProductUnitMeasureViewModel>().AsEnumerable();
            return productUnitMeasureViewModels;
        }

        public void UpdateProductUnitMeasure(ProductUnitMeasureViewModel product)
        {
            var updatedProductUnitMeasureViewModel = Utils.UpdateBase<ProductUnitMeasure, ProductUnitMeasureViewModel>(product);
            Clients.Others.updateProductUnitMeasure(updatedProductUnitMeasureViewModel);
        }

        public void DestroyProductUnitMeasure(ProductUnitMeasureViewModel productUnitMeasure)
        {
            var deletedProductUnitMeasureViewModel = Utils.DeleteBase<ProductUnitMeasure, ProductUnitMeasureViewModel>(productUnitMeasure);
            Clients.Others.destroyProductUnitMeasure(deletedProductUnitMeasureViewModel);
        }

        public ProductStoreViewModel CreateProductStore(ProductStoreViewModel product)
        {
            ProductStoreViewModel createdProductStoreViewModel = Utils.CreateBase<ProductStore, ProductStoreViewModel>(product);
            Clients.Others.createProductStore(createdProductStoreViewModel);
            return createdProductStoreViewModel;
        }

        public IEnumerable<ProductStoreViewModel> ReadProductStore(DataSourceRequest request)
        {
            var productStoreViewModels = Utils.ReadBase<ProductStore, ProductStoreViewModel>().AsEnumerable();
            return productStoreViewModels;
        }

        //public DataSourceResult ReadProductStore(DataSourceRequest request)
        //{
        //    var productStoreViewModels = Utils.ReadBase<ProductStore, ProductStoreViewModel>().AsEnumerable();
        //    return productStoreViewModels.AsQueryable().ToDataSourceResult(request);
        //}

        public void UpdateProductStore(ProductStoreViewModel product)
        {
            var updatedProductStoreViewModel = Utils.UpdateBase<ProductStore, ProductStoreViewModel>(product);
            Clients.Others.updateProductStore(updatedProductStoreViewModel);
        }

        public void DestroyProductStore(ProductStoreViewModel productStore)
        {
            var deletedProductStoreViewModel = Utils.DeleteBase<ProductStore, ProductStoreViewModel>(productStore);
            Clients.Others.destroyProductStore(deletedProductStoreViewModel);
        }

        public DataSourceResult ReadFileViewModel(DataSourceRequest request)
        {
            return null; // не бачка
        }
    }
}