﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.MVC.Models;
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
            var deletedProductViewModel = Utils.UpdateBase<Product, ProductViewModel>(product);
            Clients.Others.destroyProduct(deletedProductViewModel);
        }
    }
}