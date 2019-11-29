﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Shared;

namespace Shared.Migrations
{
    [DbContext(typeof(ExilenceContext))]
    [Migration("20191123140703_Initial")]
    partial class Initial
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Shared.Entities.Account", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Accounts");
                });

            modelBuilder.Entity("Shared.Entities.Character", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AccountId")
                        .HasColumnType("int");

                    b.Property<int>("Ascendancy")
                        .HasColumnType("int");

                    b.Property<int>("Class")
                        .HasColumnType("int");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<int?>("LeagueId")
                        .HasColumnType("int");

                    b.Property<int>("Level")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AccountId");

                    b.HasIndex("LeagueId");

                    b.ToTable("Characters");
                });

            modelBuilder.Entity("Shared.Entities.Connection", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AccountId")
                        .HasColumnType("int");

                    b.Property<string>("ConnectionId")
                        .IsRequired()
                        .HasColumnType("nvarchar(100)")
                        .HasMaxLength(100);

                    b.Property<DateTime>("Created")
                        .HasColumnType("datetime2")
                        .HasMaxLength(20);

                    b.Property<int?>("GroupId")
                        .HasColumnType("int");

                    b.Property<string>("InstanceName")
                        .IsRequired()
                        .HasColumnType("nvarchar(20)")
                        .HasMaxLength(20);

                    b.HasKey("Id");

                    b.HasIndex("AccountId");

                    b.HasIndex("GroupId");

                    b.ToTable("Connections");
                });

            modelBuilder.Entity("Shared.Entities.Group", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<DateTime>("Created")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Groups");
                });

            modelBuilder.Entity("Shared.Entities.League", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Leagues");
                });

            modelBuilder.Entity("Shared.Entities.PricedItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<decimal?>("Calculated")
                        .HasColumnType("decimal");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<bool>("Corrupted")
                        .HasColumnType("bit");

                    b.Property<bool>("Elder")
                        .HasColumnType("bit");

                    b.Property<string>("FrameType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Icon")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal>("Ilvl")
                        .HasColumnType("decimal");

                    b.Property<int>("Level")
                        .HasColumnType("int");

                    b.Property<int>("Links")
                        .HasColumnType("int");

                    b.Property<decimal?>("Max")
                        .HasColumnType("decimal");

                    b.Property<decimal?>("Mean")
                        .HasColumnType("decimal");

                    b.Property<decimal?>("Median")
                        .HasColumnType("decimal");

                    b.Property<decimal?>("Min")
                        .HasColumnType("decimal");

                    b.Property<decimal?>("Mode")
                        .HasColumnType("decimal");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Quality")
                        .HasColumnType("int");

                    b.Property<bool>("Shaper")
                        .HasColumnType("bit");

                    b.Property<int>("Sockets")
                        .HasColumnType("int");

                    b.Property<int>("StackSize")
                        .HasColumnType("int");

                    b.Property<int?>("StashtabId")
                        .HasColumnType("int");

                    b.Property<int>("Tier")
                        .HasColumnType("int");

                    b.Property<int>("TotalStackSize")
                        .HasColumnType("int");

                    b.Property<string>("TypeLine")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Variant")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("StashtabId");

                    b.ToTable("PricedItems");
                });

            modelBuilder.Entity("Shared.Entities.Snapshot", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<DateTime>("Datestamp")
                        .HasColumnType("datetime2");

                    b.Property<int?>("SnapshotProfileId")
                        .HasColumnType("int");

                    b.Property<decimal>("TotalValue")
                        .HasColumnType("decimal");

                    b.HasKey("Id");

                    b.HasIndex("SnapshotProfileId");

                    b.ToTable("Snapshots");
                });

            modelBuilder.Entity("Shared.Entities.SnapshotProfile", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int?>("AccountId")
                        .HasColumnType("int");

                    b.Property<string>("ActiveLeagueId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ActivePriceLeagueId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ActiveStashTabIds")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("AccountId");

                    b.ToTable("SnapshotProfiles");
                });

            modelBuilder.Entity("Shared.Entities.Stashtab", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("ClientId")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<string>("Color")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Index")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("SnapshotId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("SnapshotId");

                    b.ToTable("StashTabs");
                });

            modelBuilder.Entity("Shared.Entities.Character", b =>
                {
                    b.HasOne("Shared.Entities.Account", null)
                        .WithMany("Characters")
                        .HasForeignKey("AccountId");

                    b.HasOne("Shared.Entities.League", "League")
                        .WithMany()
                        .HasForeignKey("LeagueId");
                });

            modelBuilder.Entity("Shared.Entities.Connection", b =>
                {
                    b.HasOne("Shared.Entities.Account", "Account")
                        .WithMany()
                        .HasForeignKey("AccountId");

                    b.HasOne("Shared.Entities.Group", null)
                        .WithMany("Connections")
                        .HasForeignKey("GroupId");
                });

            modelBuilder.Entity("Shared.Entities.PricedItem", b =>
                {
                    b.HasOne("Shared.Entities.Stashtab", null)
                        .WithMany("PricedItems")
                        .HasForeignKey("StashtabId");
                });

            modelBuilder.Entity("Shared.Entities.Snapshot", b =>
                {
                    b.HasOne("Shared.Entities.SnapshotProfile", null)
                        .WithMany("Snapshots")
                        .HasForeignKey("SnapshotProfileId");
                });

            modelBuilder.Entity("Shared.Entities.SnapshotProfile", b =>
                {
                    b.HasOne("Shared.Entities.Account", null)
                        .WithMany("Profiles")
                        .HasForeignKey("AccountId");
                });

            modelBuilder.Entity("Shared.Entities.Stashtab", b =>
                {
                    b.HasOne("Shared.Entities.Snapshot", null)
                        .WithMany("StashTabs")
                        .HasForeignKey("SnapshotId");
                });
#pragma warning restore 612, 618
        }
    }
}
