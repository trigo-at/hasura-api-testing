import clearDb, { closeConnection } from "./utils/clear-db";
import client from "./utils/client";

describe("Todo", () => {
  // reset the database before each run
  beforeEach(clearDb);

  // close PG connection after all tests
  afterAll(closeConnection);

  /**
   * Check that two different users only see the todos that they created themselves
   * and not see any todos from the other user
   */
  describe("user: Franz + Herbert", () => {
    it("should only see his todos", async () => {
      // create sdk clients and provide the defaultRole = user, a username and a userId
      // all client requests are scoped to the passed in options

      // create a client with credentials for Franz
      const franzClient = client({defaultRole:'user', username:'franz', userId:'1'});

      // create a client with credentials for Herbert
      const herbertClient = client({defaultRole:'user', username:'herbert', userId:'2'});

      // insert 2 todos for user Franz
      const franzTodo1 = await franzClient.AddTodo({description: "Franz's first todo item", is_done: false});
      const franzTodo2 = await franzClient.AddTodo({description: "Franz's second todo item", is_done: false});

      // insert 1 todo for user Herbert
      const herbertTodo1 = await herbertClient.AddTodo({description: "Herbert's first todo item", is_done: false});

      // get Franz's todos
      const franzsTodos = await franzClient.GetTodos();

      // Franz should only see his todos
      expect(franzsTodos.todo.map(todo => todo.id).sort()).toEqual([franzTodo1.insert_todo?.returning[0].id, franzTodo2.insert_todo?.returning[0].id]);

      // get Herbert's todos
      const herbertsTodos = await herbertClient.GetTodos();

      // Herbert should only see his todos
      expect(herbertsTodos.todo.map(todo => todo.id).sort()).toEqual([herbertTodo1.insert_todo?.returning[0].id]);
    });
  });
});
