using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;
using KendoMVCWrappers.Models;

namespace Inventory.MVC.Controllers
{
    public class TestController : Controller
    {
         public static List<Person> people = new List<Person>();

         static TestController()
        {
            people.Add(new Person { PersonID = 1, Name = "John",ForeignKey = 2 ,BirthDate = new DateTime(1968, 6, 26) });
            people.Add(new Person { PersonID = 2, Name = "Sara",ForeignKey = 3 ,BirthDate = new DateTime(1974, 9, 13) });
        }

        public ActionResult Index()
        {
            ViewBag.Message = "Modify this template to kick-start your ASP.NET MVC application.";

            return View();
        }

        public ActionResult GetPeople([DataSourceRequest] DataSourceRequest dsRequest)
        {
            var result = people.ToDataSourceResult(dsRequest);
            return Json(result);
        }

        public ActionResult UpdatePerson([DataSourceRequest] DataSourceRequest dsRequest, Person person)
        {
            if (person != null && ModelState.IsValid)
            {
                var toUpdate = people.FirstOrDefault(p => p.PersonID == person.PersonID);
                TryUpdateModel(toUpdate);
            }

            return Json(ModelState.ToDataSourceResult());
        }
    }
}