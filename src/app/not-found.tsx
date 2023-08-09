import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center">
      <p className="mt-10">Sorry, the requested post does not exist.</p>
      <Link href="/">Back to Home</Link>
    </div>
  );
}

// import MessageComponent from "@/components/ui/shared/MessageComponent";
// import { dateMetatagInfo } from "@/data";
// import { INotificationMessage, RequiredMetatags } from "@/interfaces";

// const NotFound = () => {
//   const notificationMessageInfo: INotificationMessage = {
//     topic: "404",
//     message: "Esta página no existe",
//     comment: "¡Ups! Parece que has llegado a una página que no existe.",
//   };

//   const metatagsInfo: RequiredMetatags = {
//     title: "Esta página no existe | imSoft",
//     description: "¡Ups! Parece que has llegado a una página que no existe",
//     keywords: "404, Esta página no existe, imSoft",
//     author: "Brandon Uriel García Ramos",
//     subject: "404",
//     date: dateMetatagInfo,
//     type: "404",
//     source: "https://www.imsoft.io/404",
//     image: "https://firebasestorage.googleapis.com/v0/b/imsoft-website.appspot.com/o/Logos%20Empresa%2FLogotipo%20imSoft.png?alt=media&token=4b71448f-4047-402f-8b41-82a6c5e59ec",
//     url: "https://www.imsoft.io/404",
//     robots: "index,follow",
//     _id: "",
//     tags: []
//   };

//   return (
//     <>
//         {/* MetaEtiquetas Básicas */}
//         <title>{metatagsInfo.title}</title>
//         <meta name="title" content={metatagsInfo.title} />
//         <meta httpEquiv="title" content={metatagsInfo.title} />
//         <meta name="description" lang="es" content={metatagsInfo.description} />
//         <meta name="keywords" lang="es" content={metatagsInfo.keywords} />
//         <meta name="date" content={metatagsInfo.date} />

//         {/* Informacion del autor */}
//         <meta name="author" content={metatagsInfo.author} />

//         {/* Dublincore */}
//         <meta name="DC.title" lang="es-MX" content={metatagsInfo.title} />
//         <meta name="DC.creator" lang="es-MX" content={metatagsInfo.author} />
//         <meta name="DC.subject" lang="es-MX" content={metatagsInfo.subject} />
//         <meta
//           name="DC.description"
//           lang="es-MX"
//           content={metatagsInfo.description}
//         />
//         <meta name="DC.publisher" lang="es-MX" content={metatagsInfo.author} />
//         <meta name="DC.date" lang="es-MX" content={metatagsInfo.date} />
//         <meta name="DC.type" lang="es-MX" content={metatagsInfo.type} />
//         <meta name="DC.identifier" lang="es-MX" content={metatagsInfo.title} />
//         <meta name="DC.source" lang="es-MX" content={metatagsInfo.source} />
//         <meta name="DC.relation" lang="es-MX" content={metatagsInfo.source} />

//         {/* Twitter */}
//         <meta name="twitter:title" content={metatagsInfo.title} />
//         <meta name="twitter:description" content={metatagsInfo.description} />
//         <meta name="twitter:image:src" content={metatagsInfo.image} />
//         <meta name="twitter:image:alt" content={metatagsInfo.title} />

//         {/* Facebook */}
//         <meta property="og:title" content={metatagsInfo.title} />
//         <meta property="og:type" content={metatagsInfo.type} />
//         <meta
//           property="og:url"
//           content={`https://www.imsoft.io${metatagsInfo.url}`}
//         />
//         <meta property="og:image" content={metatagsInfo.image} />
//         <meta property="og:description" content={metatagsInfo.description} />

//         {/* Google + / Pinterest */}
//         <meta itemProp="description" content={metatagsInfo.description} />
//         <meta itemProp="image" content={metatagsInfo.image} />

//         {/* Robots */}
//         <meta name="robots" content={metatagsInfo.robots} />

//       <main>
//         <MessageComponent
//           topic={notificationMessageInfo.topic}
//           message={notificationMessageInfo.message}
//           comment={notificationMessageInfo.comment}
//         />
//       </main>
//     </>
//   );
// };

// export default NotFound;
