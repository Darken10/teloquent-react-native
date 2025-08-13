/**
 * Exemple d'utilisation des relations many-to-many dans Teloquent
 */
import { Teloquent, Model } from '../index';
import * as SQLite from 'expo-sqlite';

// Initialisation de la connexion
Teloquent.initialize({
  driver: 'expo',
  database: SQLite.openDatabase('many_to_many_example.db')
});

// Définition des modèles
class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  
  // Relation many-to-many avec Role
  roles() {
    return this.belongsToMany(Role, 'user_roles', 'user_id', 'role_id');
  }
  
  // Relation many-to-many avec Project
  projects() {
    return this.belongsToMany(Project, 'project_members', 'user_id', 'project_id')
      .withPivot(['is_owner', 'joined_at']);
  }
}

class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  
  // Relation many-to-many avec User
  users() {
    return this.belongsToMany(User, 'user_roles', 'role_id', 'user_id');
  }
  
  // Relation many-to-many avec Permission
  permissions() {
    return this.belongsToMany(Permission, 'role_permissions', 'role_id', 'permission_id');
  }
}

class Permission extends Model {
  declare id: number;
  declare name: string;
  declare code: string;
  
  // Relation many-to-many avec Role
  roles() {
    return this.belongsToMany(Role, 'role_permissions', 'permission_id', 'role_id');
  }
}

class Project extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  
  // Relation many-to-many avec User
  members() {
    return this.belongsToMany(User, 'project_members', 'project_id', 'user_id')
      .withPivot(['is_owner', 'joined_at']);
  }
  
  // Relation many-to-many avec Tag
  tags() {
    return this.belongsToMany(Tag, 'project_tags', 'project_id', 'tag_id');
  }
}

class Tag extends Model {
  declare id: number;
  declare name: string;
  
  // Relation many-to-many avec Project
  projects() {
    return this.belongsToMany(Project, 'project_tags', 'tag_id', 'project_id');
  }
}

// Exemple d'utilisation
async function runExample() {
  try {
    // Créer les tables
    await Teloquent.schema.createTable('users', (table) => {
      table.increments('id');
      table.string('name');
      table.string('email').unique();
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('roles', (table) => {
      table.increments('id');
      table.string('name').unique();
      table.string('description');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('permissions', (table) => {
      table.increments('id');
      table.string('name');
      table.string('code').unique();
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('projects', (table) => {
      table.increments('id');
      table.string('name');
      table.text('description');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('tags', (table) => {
      table.increments('id');
      table.string('name').unique();
      table.timestamps();
    });
    
    // Créer les tables pivots
    await Teloquent.schema.createTable('user_roles', (table) => {
      table.integer('user_id').unsigned();
      table.integer('role_id').unsigned();
      table.primary(['user_id', 'role_id']);
      table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
      table.foreign('role_id').references('id').on('roles').onDelete('CASCADE');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('role_permissions', (table) => {
      table.integer('role_id').unsigned();
      table.integer('permission_id').unsigned();
      table.primary(['role_id', 'permission_id']);
      table.foreign('role_id').references('id').on('roles').onDelete('CASCADE');
      table.foreign('permission_id').references('id').on('permissions').onDelete('CASCADE');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('project_members', (table) => {
      table.integer('project_id').unsigned();
      table.integer('user_id').unsigned();
      table.boolean('is_owner').defaultTo(false);
      table.datetime('joined_at');
      table.primary(['project_id', 'user_id']);
      table.foreign('project_id').references('id').on('projects').onDelete('CASCADE');
      table.foreign('user_id').references('id').on('users').onDelete('CASCADE');
      table.timestamps();
    });
    
    await Teloquent.schema.createTable('project_tags', (table) => {
      table.integer('project_id').unsigned();
      table.integer('tag_id').unsigned();
      table.primary(['project_id', 'tag_id']);
      table.foreign('project_id').references('id').on('projects').onDelete('CASCADE');
      table.foreign('tag_id').references('id').on('tags').onDelete('CASCADE');
      table.timestamps();
    });
    
    // Créer des utilisateurs
    const user1 = await User.create({
      name: 'Jean Dupont',
      email: 'jean@example.com'
    });
    
    const user2 = await User.create({
      name: 'Marie Martin',
      email: 'marie@example.com'
    });
    
    // Créer des rôles
    const adminRole = await Role.create({
      name: 'Admin',
      description: 'Administrateur système'
    });
    
    const editorRole = await Role.create({
      name: 'Éditeur',
      description: 'Peut éditer du contenu'
    });
    
    const viewerRole = await Role.create({
      name: 'Lecteur',
      description: 'Peut seulement lire du contenu'
    });
    
    // Créer des permissions
    const createPermission = await Permission.create({
      name: 'Créer',
      code: 'create'
    });
    
    const editPermission = await Permission.create({
      name: 'Éditer',
      code: 'edit'
    });
    
    const deletePermission = await Permission.create({
      name: 'Supprimer',
      code: 'delete'
    });
    
    const viewPermission = await Permission.create({
      name: 'Voir',
      code: 'view'
    });
    
    // Créer des projets
    const project1 = await Project.create({
      name: 'Projet Alpha',
      description: 'Premier projet test'
    });
    
    const project2 = await Project.create({
      name: 'Projet Beta',
      description: 'Second projet test'
    });
    
    // Créer des tags
    const tag1 = await Tag.create({ name: 'Urgent' });
    const tag2 = await Tag.create({ name: 'En cours' });
    const tag3 = await Tag.create({ name: 'Terminé' });
    
    // Attacher des rôles aux utilisateurs
    await user1.roles().attach([adminRole.id, editorRole.id]);
    await user2.roles().attach([editorRole.id, viewerRole.id]);
    
    // Attacher des permissions aux rôles
    await adminRole.permissions().attach([
      createPermission.id, 
      editPermission.id, 
      deletePermission.id, 
      viewPermission.id
    ]);
    
    await editorRole.permissions().attach([
      createPermission.id, 
      editPermission.id, 
      viewPermission.id
    ]);
    
    await viewerRole.permissions().attach([viewPermission.id]);
    
    // Attacher des utilisateurs aux projets avec des données pivot
    const now = new Date().toISOString();
    await project1.members().attach({
      [user1.id]: { is_owner: true, joined_at: now },
      [user2.id]: { is_owner: false, joined_at: now }
    });
    
    await project2.members().attach({
      [user2.id]: { is_owner: true, joined_at: now }
    });
    
    // Attacher des tags aux projets
    await project1.tags().attach([tag1.id, tag2.id]);
    await project2.tags().attach([tag2.id, tag3.id]);
    
    // Récupérer un utilisateur avec ses rôles
    const userWithRoles = await User.with('roles').find(user1.id);
    console.log(`Utilisateur: ${userWithRoles?.name}`);
    console.log('Rôles:');
    userWithRoles?.roles().get().forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });
    
    // Récupérer un rôle avec ses permissions
    const roleWithPermissions = await Role.with('permissions').find(adminRole.id);
    console.log(`\nRôle: ${roleWithPermissions?.name}`);
    console.log('Permissions:');
    roleWithPermissions?.permissions().get().forEach(permission => {
      console.log(`- ${permission.name} (${permission.code})`);
    });
    
    // Récupérer un projet avec ses membres et les données pivot
    const projectWithMembers = await Project.with('members').find(project1.id);
    console.log(`\nProjet: ${projectWithMembers?.name}`);
    console.log('Membres:');
    projectWithMembers?.members().get().forEach(member => {
      const pivotData = member.pivot;
      console.log(`- ${member.name} (Propriétaire: ${pivotData.is_owner ? 'Oui' : 'Non'}, Rejoint le: ${pivotData.joined_at})`);
    });
    
    // Récupérer un projet avec ses tags
    const projectWithTags = await Project.with('tags').find(project1.id);
    console.log(`\nProjet: ${projectWithTags?.name}`);
    console.log('Tags:');
    projectWithTags?.tags().get().forEach(tag => {
      console.log(`- ${tag.name}`);
    });
    
    // Détacher un rôle d'un utilisateur
    await user1.roles().detach([editorRole.id]);
    
    // Synchroniser les rôles d'un utilisateur (remplacer tous les rôles existants)
    await user2.roles().sync([viewerRole.id]);
    
    // Vérifier les rôles après modification
    const updatedUser1 = await User.with('roles').find(user1.id);
    console.log(`\nUtilisateur mis à jour: ${updatedUser1?.name}`);
    console.log('Rôles après détachement:');
    updatedUser1?.roles().get().forEach(role => {
      console.log(`- ${role.name}`);
    });
    
    const updatedUser2 = await User.with('roles').find(user2.id);
    console.log(`\nUtilisateur mis à jour: ${updatedUser2?.name}`);
    console.log('Rôles après synchronisation:');
    updatedUser2?.roles().get().forEach(role => {
      console.log(`- ${role.name}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Exécuter l'exemple
runExample();
