namespace Inventory.DAL
{
    public class Product : EntityBase
    {
        public string Name { get; set; }

        public string Code { get; set; }

        public decimal? UnitPrice { get; set; }

        public decimal? UnitsInStock { get; set; }

        public decimal? UnitsOnOrder { get; set; }

        public decimal? ReorderLevel { get; set; }

        public decimal? Quantity { get; set; }

        public long? CategoryId { get; set; }
        public ProductCategory Category { get; set; }


        public long? UnitMeasureId { get; set; }

        public ProductUnitMeasure UnitMeasure { get; set; }

        public long? StoreId { get; set; } // Vajno e da e nullabe, togava cascade deletes is false
        public ProductStore Store { get; set; }
    }
}