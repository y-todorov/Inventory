using Inventory.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.MVC.Models;

namespace Inventory.MVC.Controllers.ElementControllers
{
    public class TownController : ControllerBase
    {
       //[OutputCache(Duration=100, VaryByParam="id")]
       public ActionResult Details(int id, InventoryContext context)
       {
           
           var town = AutoMapper.Mapper.Map<TownViewModel>(context.Elements.OfType<Town>().FirstOrDefault(t => t.Id == id));
           if (town != null)
           {
               return View(town);
           }
           else
           {
               return new HttpNotFoundResult("Не съществува град с Id=" + id);
           }
       }
    }
}