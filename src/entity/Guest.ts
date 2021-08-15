import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  greetingText: string;
}
