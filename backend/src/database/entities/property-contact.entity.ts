import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Predio } from './predio.entity';
import { Contact } from './contact.entity';

@Entity('property_contacts')
export class PropertyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'property_id' })
  propertyId: string;

  @ManyToOne(() => Predio, predio => predio.propertyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  predio: Predio;

  @Column({ type: 'uuid', name: 'contact_id' })
  contactId: string;

  @ManyToOne(() => Contact, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column({ length: 80, name: 'relationship_type' })
  relationshipType: string;

  @Column({ default: false, name: 'is_primary' })
  isPrimary: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
