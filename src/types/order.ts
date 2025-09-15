export enum OrderStatus {
    PENDENTE = "PENDENTE",
    PRODUCAO = "PRODUCAO",
    FINALIZADO = "FINALIZADO",
    POSTADO = "POSTADO",
}

export enum ItemStatus {
    IMPRESSO = "IMPRESSO",
    ENCARTELADO = "ENCARTELADO",
    EM_SILK = "EM_SILK",
    CHAPADO = "CHAPADO",
    VERSO_PRONTO = "VERSO_PRONTO",
    ACABAMENTO = "ACABAMENTO",
    EMBALADO = "EMBALADO",
}

export enum Material {
    ADESIVO = "ADESIVO",
    ELETROSTATICO = "ELETROSTATICO",
    BRANCO_FOSCO = "BRANCO_FOSCO",
    LONA = "LONA",
}

export interface Item {
    name: string;
    quantity: number;
    saleQuantity: number;
    material: Material;
    image: string;
    itemStatus: ItemStatus;
    orderId: number;
}

export interface Order { 
    id: number;
    clientName: string;
    status: OrderStatus;
    items: Item[];
    createdAt: string;
}