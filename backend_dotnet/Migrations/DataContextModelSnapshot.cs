﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SU_COIN_BACK_END.Data;

#nullable disable

namespace SU_COIN_BACK_END.Migrations
{
    [DbContext(typeof(DataContext))]
    partial class DataContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("SU_COIN_BACK_END.Models.Project", b =>
                {
                    b.Property<int>("ProjectID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime?>("Date")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("FileHash")
                        .HasColumnType("longtext");

                    b.Property<bool>("IsAuctionCreated")
                        .HasColumnType("tinyint(1)");

                    b.Property<bool>("IsAuctionStarted")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("MarkDown")
                        .HasColumnType("longtext");

                    b.Property<string>("ProjectDescription")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("ProjectName")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("ProposerAddress")
                        .HasColumnType("longtext");

                    b.Property<double>("Rating")
                        .HasColumnType("double");

                    b.Property<string>("Status")
                        .HasColumnType("longtext");

                    b.Property<bool>("ViewerAccepted")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("ViewerAcceptedAddress")
                        .HasColumnType("longtext");

                    b.HasKey("ProjectID");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("SU_COIN_BACK_END.Models.ProjectPermission", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<bool>("IsAccepted")
                        .HasColumnType("tinyint(1)");

                    b.Property<int>("ProjectID")
                        .HasColumnType("int");

                    b.Property<string>("Role")
                        .HasColumnType("longtext");

                    b.Property<int>("UserID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.ToTable("ProjectPermissions");
                });

            modelBuilder.Entity("SU_COIN_BACK_END.Models.Rating", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("ProjectID")
                        .HasColumnType("int");

                    b.Property<double>("Rate")
                        .HasColumnType("double");

                    b.Property<int>("UserID")
                        .HasColumnType("int");

                    b.HasKey("ID");

                    b.ToTable("Ratings");
                });

            modelBuilder.Entity("SU_COIN_BACK_END.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<bool>("IsVerified")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("MailAddress")
                        .HasColumnType("longtext");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int?>("Nonce")
                        .HasColumnType("int");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Surname")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime?>("VerificationExpiration")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("VerificationToken")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });
#pragma warning restore 612, 618
        }
    }
}
