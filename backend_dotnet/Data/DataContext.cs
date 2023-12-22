using SU_COIN_BACK_END.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using Pomelo.EntityFrameworkCore.MySql;
using SU_COIN_BACK_END.Services;

namespace SU_COIN_BACK_END.Data
{
    
    public class DataContext : DbContext 
    {
        public DataContext(DbContextOptions<DataContext> options): base(options){}
        public virtual DbSet <Project> Projects {get; set;}
        public virtual DbSet<User> Users {get; set;}
        public virtual DbSet<ProjectPermission> ProjectPermissions {get; set;}
        public virtual DbSet<Rating> Ratings {get; set;}
        //"server=185.93.68.7;database=aleriac2_sulaunch;username=aleriac2_sulaunch;password=Susam135;"
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();
                var connectionString = configuration.GetConnectionString("DefaultConnection");
                optionsBuilder.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 11)));
            }
        }
    }
}

//aa

