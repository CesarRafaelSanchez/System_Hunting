import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  opportunityId: string;

  @Column({ name: 'form_code', length: 50 })
  formCode: string; // e.g. 'FORM_ASIGNACION', 'FORM_FICHA_DATOS'

  @Column({ name: 'submitted_by_user_id', type: 'uuid', nullable: true })
  submittedByUserId: string;

  @Column({ name: 'raw_payload_json', type: 'jsonb' })
  rawPayloadJson: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
