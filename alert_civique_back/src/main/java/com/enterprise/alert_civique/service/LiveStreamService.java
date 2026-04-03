package com.enterprise.alert_civique.service;

import com.enterprise.alert_civique.dto.LiveStreamDTO;
import com.enterprise.alert_civique.entity.LiveStream;
import java.util.List;
import java.util.Optional;


/**
 * 
 * Service de gestion des lives streams.
 *  
 * 
 * @since 2024-06
 * @author     
 * @version 1.0
 * @see LiveStreamController
 * 
 */

public interface LiveStreamService {
    /**
     * Crée, met à jour, supprime et récupère les lives streams.
     * @param liveStreamDTO Objet de transfert de données contenant les informations du live stream à créer ou mettre à jour. 
     * @param livestreamId Identifiant du live stream à supprimer ou récupérer.
     * @return Un objet LiveStream représentant le live stream créé, mis à jour ou supprimé, ou une liste de tous les live streams.
     * @throws Exception En cas d'erreur lors de la création, mise à jour, suppression ou récupération des live streams.    
     * @see LiveStreamRepository : Interface de repository pour la gestion des données de live streams en base de données.
      * @see LiveStreamServiceImpl : Implémentation concrète de l'interface LiveStreamService, contenant la logique métier pour la gestion des live streams.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion des live streams, utilisant LiveStreamService pour les opérations métier.
      * @see LiveStreamDTO : Classe de transfert de données utilisée pour encapsuler les informations des live streams lors des opérations de création et de mise à jour.
      * @see LiveStream : Entité représentant un live stream dans la base de données, avec des champs tels que id, title, description, url, startTime, endTime, etc.
      * @see LiveStreamRepository : Interface de repository pour la gestion des données de live streams en base de données, avec des méthodes pour sauvegarder, trouver, mettre à jour et supprimer des live streams.
      * @see LiveStreamServiceImpl : Implémentation concrète de l'interface Live    StreamService, contenant la logique métier pour la gestion des live streams, y compris la validation des données, la gestion des exceptions et l'interaction avec le repository.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion  des live streams, utilisant LiveStreamService pour les opérations métier, et gérant les requêtes HTTP pour créer, mettre à jour, supprimer et récupérer des live streams.
      * @param liveStreamDTO Objet de transfert de données contenant les informations du live stream à créer ou mettre à jour.
      * @param livestreamId Identifiant du live stream à supprimer ou récupérer.        
      * @return Un objet LiveStream représentant le live stream créé, mis à jour ou supprimé, ou une liste de tous les live streams.
      * @throws Exception En cas d'erreur lors de la création, mise à jour, suppression ou récupération des live streams.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion des live streams, utilisant LiveStreamService pour les opérations métier.
      * @see LiveStream : Entité représentant un live stream dans la base de données, avec des champs tels que id, title, description, url, startTime, endTime, etc.
      * @see LiveStreamDTO : Classe de transfert de données utilisée pour encapsuler les informations des live streams lors des opérations de création et de mise à jour.
      * @since 2024-06
      * 
     */
    LiveStream createLiveStream(LiveStreamDTO liveStreamDTO) throws Exception;
    /**
     * Met à jour, supprime et récupère les lives streams.
     * 
     * @param liveStreamDTO : Objet de transfert de données contenant les informations du live stream à mettre à jour.
     * @param livestreamId : Identifiant du live stream à supprimer ou récupérer.
     * @param
     * @see LiveStreamRepository : Interface de repository pour la gestion des données de live streams en base de données.
     * @see LiveStreamServiceImpl : Implémentation concrète de l'interface LiveStreamService, contenant la logique métier pour la gestion des live streams.
     * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion
     * @return
     * @throws Exception En cas d'erreur lors de la mise à jour, suppression ou récupération des live streams.    
      * @see LiveStreamRepository : Interface de repository pour la gestion des données de live streams en base de données.
      * @see LiveStreamServiceImpl : Implémentation concrète de l'interface LiveStreamService, contenant la logique métier pour la gestion des live streams, y compris la validation des données, la gestion des exceptions et l'interaction avec le repository.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion  des live streams, utilisant LiveStreamService pour les opérations métier, et gérant les requêtes HTTP pour créer, mettre à jour, supprimer et récupérer des live streams.
      * @see LiveStreamDTO : Classe de transfert de données utilisée pour encapsuler les informations des live streams lors des opérations de création et de mise à jour.
      * @see LiveStream : Entité représentant un live stream dans la base de données, avec des champs tels que id, title, description, url, startTime, endTime, etc.
      * @param liveStreamDTO Objet de transfert de données contenant les informations du live stream à mettre à jour.
      * @param livestreamId Identifiant du live stream à supprimer ou récupérer.        
      * @return Un objet LiveStream représentant le live stream mis à jour ou supprimé, ou une liste de tous les live streams.
      * @throws Exception En cas d'erreur lors de la mise à jour, suppression ou récupération des live streams.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion des live streams, utilisant LiveStreamService pour les opérations métier.
      * @see LiveStream : Entité représentant un live stream dans la base de données, avec des champs tels que id, title, description, url, startTime, endTime, etc.
      * @see LiveStreamDTO : Classe de transfert de données utilisée pour encapsuler les informations des live streams lors des opérations de création et de mise à jour.
      * @since 2024-06
     */
    LiveStream updateLiveStream(LiveStreamDTO liveStreamDTO) throws Exception;
    /**
     * Supprime un live stream.
     *
     * @param livestreamId Identifiant du live stream à supprimer.
     * @return L'objet LiveStream représentant le live stream supprimé.
     */
    LiveStream deleteLiveStream(Long livestreamId );
    /**
     * Récupère tous les live streams ou un live stream spécifique par son identifiant.
     * 
     * @return
     */
    List<LiveStream> getALLLiveStream();
    /**
     * Récupère un live stream spécifique par son identifiant.  
     * @param livestreamId
     * @return: Un objet LiveStream représentant le live stream correspondant à l'identifiant fourni, ou une valeur vide si aucun live stream n'est trouvé avec cet identifiant.
     * @throws Exception: En cas d'erreur lors de la récupération du live stream, par exemple si l'identifiant est invalide ou si une erreur de base de données se produit.
      * @see LiveStreamController : Contrôleur REST exposant les endpoints pour la gestion des live streams, utilisant LiveStreamService pour les opérations métier.
      * @see LiveStream : Entité représentant un live stream dans la base de données, avec des champs tels que id, title, description, url, startTime, endTime, etc.
    
      * @since 2024-06
     */
    Optional<LiveStream>getLiveStreamById(Long livestreamId) throws Exception;

}
