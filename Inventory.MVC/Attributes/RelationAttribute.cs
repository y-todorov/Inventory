using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inventory.MVC.Attributes
{
    [AttributeUsageAttribute(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false,
        Inherited = true)]
    public class RelationAttribute : Attribute
    {
        public Type EntityType { get; set; }

        public string DataValueField { get; set; }

        public string DataTextField { get; set; }
    }
}