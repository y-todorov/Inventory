using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Inventory.DAL;
using Inventory.MVC.Models;
using Kendo.Mvc.UI;

namespace Inventory.MVC.Controllers
{
    public class NoteController : ControllerBase
    {
        public ActionResult Read([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = ReadBase<Note, NoteViewModel>(request, context.Notes);
            return result;
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Create([DataSourceRequest] DataSourceRequest request, InventoryContext context, NoteViewModel noteViewModel)
        {
            JsonResult result = CreateBase<Note, NoteViewModel>(request, context, noteViewModel);
            return result;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Update([DataSourceRequest] DataSourceRequest request, InventoryContext context, NoteViewModel noteViewModel)
        {
            JsonResult result = UpdateBase<Note, NoteViewModel>(request, context, noteViewModel);
            return result;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Destroy([DataSourceRequest] DataSourceRequest request, InventoryContext context, NoteViewModel noteViewModel)
        {
            JsonResult result = DestroyBase<Note, NoteViewModel>(request, context, noteViewModel);
            return result;
        }
    }
}