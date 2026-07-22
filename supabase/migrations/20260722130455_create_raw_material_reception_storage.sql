create table public.raw_material_receptions (
    id uuid not null,
    received_at timestamp with time zone not null,
    shipment_number character varying(10) not null,
    provider_name text not null,

    constraint pk_raw_material_receptions
        primary key (id),

    constraint uq_raw_material_receptions_shipment_number
        unique (shipment_number)
);

create table public.raw_material_bales (
    id uuid not null,
    reception_id uuid not null,
    bale_number character varying(10) not null,
    material_type character varying(20) not null,
    dtex numeric not null,
    gross_weight_kg numeric not null,
    container_weight_kg numeric not null,
    status character varying(40) not null,

    constraint pk_raw_material_bales
        primary key (id),

    constraint fk_raw_material_bales_reception_id
        foreign key (reception_id)
        references public.raw_material_receptions(id)
        on delete restrict,

    constraint uq_raw_material_bales_reception_bale_number
        unique (reception_id, bale_number)
);

create index ix_raw_material_bales_reception_id
    on public.raw_material_bales (reception_id);

alter table public.raw_material_receptions
    enable row level security;

alter table public.raw_material_bales
    enable row level security;

revoke all privileges
    on public.raw_material_receptions, public.raw_material_bales
    from anon, authenticated, service_role;
