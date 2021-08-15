import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Guest {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ length: 200 })
  greetingText: string;

  @Column()
  studentId: string;

  @Column()
  phanName: string;

  @Column()
  nameTitle: string;

  @Column()
  phanType: string;

  @Column()
  ingredient: string;

  @CreateDateColumn()
  createdAt: Date;
}
