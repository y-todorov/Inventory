using AutoMapper;
using Inventory.DAL;
using Inventory.MVC.Models;

namespace Inventory.MVC
{
    public static class AutoMapperConfig
    {
        public static void Execute()
        {
            Mapper.CreateMap<decimal?, double?>().ConvertUsing<NullableDecimalToNullableDoubleTypeConverter>();
            Mapper.CreateMap<decimal?, double>().ConvertUsing<NullableDecimalToDoubleTypeConverter>();
            Mapper.CreateMap<double?, decimal?>().ConvertUsing<NullableDoubleToNullableDecimalTypeConverter>();
            Mapper.CreateMap<double, decimal?>().ConvertUsing<DoubleToNullableDecimalTypeConverter>();

            Mapper.CreateMap<Product, ProductViewModel>();
            Mapper.CreateMap<ProductViewModel, Product>();

            Mapper.CreateMap<ProductCategoryViewModel, ProductCategory>();
            Mapper.CreateMap<ProductCategory, ProductCategoryViewModel>();

            Mapper.CreateMap<ProductStoreViewModel, ProductStore>();
            Mapper.CreateMap<ProductStore, ProductStoreViewModel>();

            Mapper.CreateMap<ProductUnitMeasureViewModel, ProductUnitMeasure>();
            Mapper.CreateMap<ProductUnitMeasure, ProductUnitMeasureViewModel>();

            Mapper.CreateMap<ChangeLogViewModel, ChangeLog>();
            Mapper.CreateMap<ChangeLog, ChangeLogViewModel>();

            Mapper.CreateMap<TownViewModel, Town>();
            Mapper.CreateMap<Town, TownViewModel>();

            Mapper.CreateMap<RegionViewModel, Region>();
            Mapper.CreateMap<Region, RegionViewModel>();

            Mapper.CreateMap<MunicipalityViewModel, Municipality>();
            Mapper.CreateMap<Municipality, MunicipalityViewModel>();

            Mapper.CreateMap<IndustryViewModel, Industry>();
            Mapper.CreateMap<Industry, IndustryViewModel>();
        }

        public class CustomResolver : ValueResolver<double, decimal>
        {
            protected override decimal ResolveCore(double source)
            {
                return (decimal) source;
            }
        }

        private class DoubleToNullableDecimalTypeConverter : TypeConverter<double, decimal?>
        {
            protected override decimal? ConvertCore(double source)
            {
                var result = (decimal?) source;
                return result;
            }
        }

        private class NullableDecimalToDoubleTypeConverter : TypeConverter<decimal?, double>
        {
            protected override double ConvertCore(decimal? source)
            {
                var result = (double) source.GetValueOrDefault();
                return result;
            }
        }

        private class NullableDecimalToNullableDoubleTypeConverter : TypeConverter<decimal?, double?>
        {
            protected override double? ConvertCore(decimal? source)
            {
                var result = (double?) source;
                return result;
            }
        }

        private class NullableDoubleToNullableDecimalTypeConverter : TypeConverter<double?, decimal?>
        {
            protected override decimal? ConvertCore(double? source)
            {
                var result = (decimal?) source;
                return result;
            }
        }
    }
}